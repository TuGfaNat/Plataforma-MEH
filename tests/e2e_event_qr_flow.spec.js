// @ts-check
import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

test.describe('E2E Eventos: Cupos, QR Logístico Único, Incluidos y Lista de Espera', () => {
  // Ejecutar los pasos en serie de forma ordenada
  test.describe.configure({ mode: 'serial' });

  const unique = Date.now();
  const adminEmail = `admin_e2e_${unique}@meh.com`;
  const user1Email = `user1_e2e_${unique}@meh.com`;
  const user2Email = `user2_e2e_${unique}@meh.com`;
  const password = 'PasswordSegura123!';

  let adminToken = '';
  let user1Token = '';
  let user2Token = '';
  let eventId = null;
  let user1Qr = null;
  let user2Qr = null;

  test.beforeAll(async ({ request }) => {
    // 1. Registrar usuarios de prueba
    await request.post('http://127.0.0.1:8000/auth/register', {
      data: {
        nombres: 'Admin',
        apellidos: 'E2E',
        correo: adminEmail,
        password: password,
        telefono: '77700001'
      }
    });

    await request.post('http://127.0.0.1:8000/auth/register', {
      data: {
        nombres: 'Participante',
        apellidos: 'Uno',
        correo: user1Email,
        password: password,
        telefono: '77700002'
      }
    });

    await request.post('http://127.0.0.1:8000/auth/register', {
      data: {
        nombres: 'Participante',
        apellidos: 'Dos',
        correo: user2Email,
        password: password,
        telefono: '77700003'
      }
    });

    // 2. Asignar rol ADMIN en la base de datos y marcar es_nuevo=False
    const pyCmd = `from app.database import SessionLocal; from app.models import models; db = SessionLocal(); u = db.query(models.Usuario).filter(models.Usuario.correo == '${adminEmail}').first(); u.rol = 'ADMIN'; db.query(models.Usuario).filter(models.Usuario.correo.in_(['${adminEmail}', '${user1Email}', '${user2Email}'])).update({'es_nuevo': False}); db.commit(); db.close()`;
    execSync(`"F:\\Plataforma-MEH\\backend\\venv\\Scripts\\python.exe" -c "${pyCmd}"`, { cwd: 'F:\\Plataforma-MEH\\backend' });

    // 3. Login de los tres usuarios
    const loginAdminRes = await request.post('http://127.0.0.1:8000/auth/login', {
      data: { correo: adminEmail, password: password }
    });
    adminToken = (await loginAdminRes.json()).access_token;

    const loginU1Res = await request.post('http://127.0.0.1:8000/auth/login', {
      data: { correo: user1Email, password: password }
    });
    user1Token = (await loginU1Res.json()).access_token;

    const loginU2Res = await request.post('http://127.0.0.1:8000/auth/login', {
      data: { correo: user2Email, password: password }
    });
    user2Token = (await loginU2Res.json()).access_token;
  });

  test('Paso 1: Creación de evento con cupo=1 e incluidos dinámicos genera token_qr y auto-checkpoints', async ({ request }) => {
    const res = await request.post('http://127.0.0.1:8000/eventos/', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        titulo: `Tech Summit E2E ${unique}`,
        descripcion: 'Evento integral con kit y refrigerio',
        tipo_evento: 'CONFERENCIA',
        fecha_inicio: '2026-11-20T09:00:00',
        hora_inicio: '09:00',
        modalidad: 'PRESENCIAL',
        ubicacion: 'Auditorio Central MEH',
        capacidad_max: 1,
        capacidad_maxima: 1,
        refrigerio_incluido: true,
        incluidos: 'Kit de bienvenida, Souvenirs, Certificado impreso',
        id_estado: 2
      }
    });

    expect(res.status()).toBe(201);
    const evento = await res.json();
    eventId = evento.id_evento;

    expect(evento.token_qr).toBeDefined();
    expect(evento.token_qr).toContain('EVENTO_');
    expect(evento.cupos_ocupados).toBe(0);
    expect(evento.cupos_disponibles).toBe(1);
    expect(evento.total_en_espera).toBe(0);

    // Verificar checkpoints autogenerados
    const checkpointsRes = await request.get(`http://127.0.0.1:8000/eventos/${eventId}/checkpoints`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    expect(checkpointsRes.status()).toBe(200);
    const checkpoints = await checkpointsRes.json();
    expect(checkpoints.length).toBeGreaterThanOrEqual(4);
    const nombres = checkpoints.map(c => c.nombre_checkpoint);
    expect(nombres).toContain('Acreditación y Entrada');
    expect(nombres).toContain('Entrega: Refrigerio');
    expect(nombres).toContain('Entrega: Kit de bienvenida');
    expect(nombres).toContain('Entrega: Souvenirs');
  });

  test('Paso 2: Descarga de imagen QR oficial del evento en formato PNG', async ({ request }) => {
    const res = await request.get(`http://127.0.0.1:8000/eventos/${eventId}/qr-image`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('image/png');
    const buffer = await res.body();
    expect(buffer.length).toBeGreaterThan(100);
  });

  test('Paso 3: Inscripción con cupo disponible pasa directo a CONFIRMADA con código QR único', async ({ request }) => {
    const res = await request.post(`http://127.0.0.1:8000/inscripciones/eventos/${eventId}`, {
      headers: { Authorization: `Bearer ${user1Token}` },
      data: {}
    });

    expect(res.status()).toBe(201);
    const inscripcion = await res.json();
    expect(inscripcion.estado_inscripcion).toBe('CONFIRMADA');
    expect(inscripcion.codigo_qr).toBeDefined();
    expect(typeof inscripcion.codigo_qr).toBe('string');
    expect(inscripcion.codigo_qr.length).toBeGreaterThan(10);
    user1Qr = inscripcion.codigo_qr;

    // Verificar cupos del evento
    const evRes = await request.get(`http://127.0.0.1:8000/eventos/${eventId}`);
    const evData = await evRes.json();
    expect(evData.cupos_ocupados).toBe(1);
    expect(evData.cupos_disponibles).toBe(0);
    expect(evData.total_en_espera).toBe(0);
  });

  test('Paso 4: Inscripción con cupo lleno entra a PENDIENTE_APROBACION (Lista de Espera) sin QR', async ({ request }) => {
    const res = await request.post(`http://127.0.0.1:8000/inscripciones/eventos/${eventId}`, {
      headers: { Authorization: `Bearer ${user2Token}` },
      data: {}
    });

    expect(res.status()).toBe(201);
    const inscripcion = await res.json();
    expect(inscripcion.estado_inscripcion).toBe('PENDIENTE_APROBACION');
    expect(inscripcion.codigo_qr).toBeNull();

    // Verificar lista de espera desde API de organizador
    const waitlistRes = await request.get(`http://127.0.0.1:8000/inscripciones/eventos/${eventId}/lista-espera`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    expect(waitlistRes.status()).toBe(200);
    const waitlist = await waitlistRes.json();
    expect(waitlist.length).toBe(1);
    expect(waitlist[0].id_inscripcion).toBe(inscripcion.id_inscripcion);
  });

  test('Paso 5: Organizador amplía cupos y aprueba inscripción de lista de espera', async ({ request }) => {
    // 1. Ampliar capacidad a 2
    const updateRes = await request.put(`http://127.0.0.1:8000/eventos/${eventId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { capacidad_max: 2, capacidad_maxima: 2 }
    });
    expect(updateRes.status()).toBe(200);

    // 2. Obtener la inscripción en espera
    const waitlistRes = await request.get(`http://127.0.0.1:8000/inscripciones/eventos/${eventId}/lista-espera`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const waitlist = await waitlistRes.json();
    const inscripcionEsperaId = waitlist[0].id_inscripcion;

    // 3. Aprobar inscripción
    const approveRes = await request.put(`http://127.0.0.1:8000/inscripciones/eventos/${inscripcionEsperaId}/aprobar`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    expect(approveRes.status()).toBe(200);
    const approvedData = await approveRes.json();
    expect(approvedData.estado_inscripcion).toBe('CONFIRMADA');
    expect(approvedData.codigo_qr).toBeDefined();
    user2Qr = approvedData.codigo_qr;

    // Verificar que lista de espera quedó vacía
    const waitlistAfterRes = await request.get(`http://127.0.0.1:8000/inscripciones/eventos/${eventId}/lista-espera`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const waitlistAfter = await waitlistAfterRes.json();
    expect(waitlistAfter.length).toBe(0);
  });

  test('Paso 6: El QR único del participante sirve para Acreditación y entrega de Kits sin duplicados', async ({ request }) => {
    // Obtener checkpoints del evento
    const checkpointsRes = await request.get(`http://127.0.0.1:8000/eventos/${eventId}/checkpoints`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const checkpoints = await checkpointsRes.json();
    const cpEntrada = checkpoints.find(c => c.nombre_checkpoint.includes('Acreditación'));
    const cpKit = checkpoints.find(c => c.nombre_checkpoint.includes('Kit'));

    expect(cpEntrada).toBeDefined();
    expect(cpKit).toBeDefined();

    // 1. Escaneo en checkpoint de entrada (Acreditación)
    const scanEntradaRes = await request.post(`http://127.0.0.1:8000/eventos/asistencia-qr`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { codigo_qr: user1Qr, id_checkpoint: cpEntrada.id_checkpoint }
    });
    expect(scanEntradaRes.status()).toBe(200);
    const entradaResult = await scanEntradaRes.json();
    expect(entradaResult.message).toContain('éxito');

    // 2. Doble escaneo en el mismo checkpoint debe ser rechazado
    const scanDuplicadoRes = await request.post(`http://127.0.0.1:8000/eventos/asistencia-qr`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { codigo_qr: user1Qr, id_checkpoint: cpEntrada.id_checkpoint }
    });
    expect(scanDuplicadoRes.status()).toBe(400);

    // 3. Mismo QR único escaneado en checkpoint de entrega de Kit debe ser aceptado
    const scanKitRes = await request.post(`http://127.0.0.1:8000/eventos/asistencia-qr`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { codigo_qr: user1Qr, id_checkpoint: cpKit.id_checkpoint }
    });
    expect(scanKitRes.status()).toBe(200);
    const kitResult = await scanKitRes.json();
    expect(kitResult.message).toContain('éxito');
  });

  test('Paso 7: Interfaz web renderiza Mi QR y descarga de ticket para participante confirmado', async ({ page }) => {
    page.on('console', msg => console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`));
    page.on('pageerror', err => console.log(`[BROWSER ERROR] ${err.message}`));

    // Iniciar sesión en el navegador con user1 via formulario
    await page.goto('http://localhost:5173/login');
    await page.locator('input[type="email"]').fill(user1Email);
    await page.locator('input[type="password"]').fill(password);
    await page.locator('button[type="submit"]').click();

    // Esperar navegación al dashboard
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    // Comprobar que carga la sección de eventos con el nuevo evento
    await expect(page.locator(`text=Tech Summit E2E ${unique}`)).toBeVisible({ timeout: 15000 });

    // Comprobar botón "Mi QR" para evento confirmado
    const miQrBtn = page.getByRole('button', { name: 'Mi QR' }).first();
    await expect(miQrBtn).toBeVisible();
    await miQrBtn.click();

    // El diálogo de ticket debe desplegarse con código y botón de descarga
    await expect(page.locator('text=Ticket de Entrada y Logística')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Descargar QR' })).toBeVisible();
  });
});
