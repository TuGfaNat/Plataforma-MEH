import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  makeStyles,
  shorthands,
  tokens,
  Spinner,
  Badge,
  MessageBar,
  MessageBarBody,
  Divider,
  Field,
  Input,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from '@fluentui/react-components';
import {
  Box24Regular,
  Share24Regular,
  CheckmarkCircle24Filled,
  ArrowLeft24Regular,
  Link24Regular,
  ReceiptMoney24Filled,
  Add20Regular,
  Subtract20Regular,
  ArrowDownload24Regular,
  Translate24Regular,
  WeatherMoon24Regular,
  WeatherSunny24Regular,
  Warning24Regular,
  Gift24Regular,
  VehicleTruckProfile24Regular
} from '@fluentui/react-icons';
import { QRCodeSVG } from 'qrcode.react';
import { MEHButton, MEHCard, MEHTypography } from '../components/ui';
import { useAuth, useNotify, useTheme } from '../App';
import adminService from '../services/adminService';
import pagoService from '../services/pagoService';
import { resolveApiFileUrl } from '../services/api';

const DEFAULT_SOUVENIR_IMG = "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop";

const useStyles = makeStyles({
  container: {
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground4,
    color: tokens.colorNeutralForeground1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflowX: 'hidden',
  },
  glow: {
    position: 'absolute',
    width: '650px',
    height: '650px',
    background: tokens.colorBrandBackground2,
    filter: 'blur(150px)',
    ...shorthands.borderRadius('50%'),
    opacity: 0.16,
    zIndex: 0,
    top: '-120px',
    right: '-120px',
    pointerEvents: 'none',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    padding: '16px 32px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backgroundColor: 'rgba(10, 10, 15, 0.78)',
    backdropFilter: 'blur(20px)',
    ...shorthands.borderBottom('1px', 'solid', 'rgba(255, 255, 255, 0.08)'),
    '@media (max-width: 600px)': {
      padding: '12px 16px',
    }
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
    color: 'inherit',
    cursor: 'pointer',
  },
  logo: {
    width: '36px',
    height: '36px',
    filter: 'drop-shadow(0 0 10px rgba(127, 19, 236, 0.5))',
  },
  mainWrapper: {
    maxWidth: '1120px',
    width: '100%',
    margin: '0 auto',
    padding: '32px 24px 64px 24px',
    zIndex: 1,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    '@media (max-width: 600px)': {
      padding: '16px 12px 48px 12px',
    }
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: tokens.colorNeutralForeground2,
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'color 0.2s ease',
    ':hover': {
      color: tokens.colorBrandForeground1,
    }
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.9fr',
    gap: '32px',
    alignItems: 'start',
    '@media (max-width: 860px)': {
      gridTemplateColumns: '1fr',
      gap: '24px'
    }
  },
  imageCard: {
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius('20px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3),
    overflow: 'hidden',
    boxShadow: tokens.shadow8,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '380px',
    maxHeight: '480px',
    background: 'radial-gradient(circle, rgba(127, 19, 236, 0.05) 0%, rgba(0,0,0,0.2) 100%)',
  },
  productImage: {
    width: '100%',
    height: '100%',
    maxHeight: '480px',
    objectFit: 'contain',
    transition: 'transform 0.3s ease',
    ':hover': {
      transform: 'scale(1.02)'
    }
  },
  stickyCard: {
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius('20px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3),
    padding: '24px',
    boxShadow: tokens.shadow8,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    position: 'sticky',
    top: '90px'
  },
  infoCard: {
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius('20px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3),
    padding: '24px',
    boxShadow: tokens.shadow4,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '20px'
  },
  quantityWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '4px'
  },
  qtyButton: {
    width: '38px',
    height: '38px',
    minWidth: '38px',
    ...shorthands.borderRadius('10px'),
  },
  qtyInput: {
    width: '60px',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '16px'
  },
  uploadArea: {
    ...shorthands.border('2px', 'dashed', 'rgba(127, 19, 236, 0.35)'),
    ...shorthands.borderRadius('14px'),
    padding: '20px',
    textAlign: 'center',
    cursor: 'pointer',
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: 'rgba(127, 19, 236, 0.05)',
      ...shorthands.borderColor(tokens.colorBrandStroke1)
    }
  },
  fileInput: {
    opacity: 0,
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    cursor: 'pointer'
  }
});

const SouvenirPublico = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const styles = useStyles();
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { notify } = useNotify();

  const [loading, setLoading] = useState(true);
  const [producto, setProducto] = useState(null);
  const [error, setError] = useState(null);

  // Cantidad seleccionada
  const [cantidad, setCantidad] = useState(1);

  // Modal de Pago / Compra
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentFile, setPaymentFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [purchaseCompleted, setPurchaseCompleted] = useState(false);

  useEffect(() => {
    const fetchSouvenir = async () => {
      setLoading(true);
      setError(null);
      try {
        const prod = await adminService.getSouvenirById(id);
        setProducto(prod);
        setCantidad(1);
      } catch (err) {
        console.error("Error al cargar el souvenir:", err);
        setError("El producto no existe o ya no se encuentra disponible en catálogo.");
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      void fetchSouvenir();
    }
  }, [id]);

  const handleCopyLink = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        notify("Enlace Copiado", "El enlace al souvenir se copió al portapapeles", "success");
      });
    }
  };

  const handleShareWhatsApp = () => {
    if (!producto) return;
    const url = window.location.href;
    const text = encodeURIComponent(`¡Mira este souvenir oficial de Microsoft Education Hub: *${producto.nombre}* a solo Bs. ${producto.precio}! Adquiérelo aquí: ${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share && producto) {
      try {
        await navigator.share({
          title: producto.nombre,
          text: `Souvenir oficial MEH: ${producto.nombre} - Bs. ${producto.precio}`,
          url: window.location.href,
        });
      } catch {
        // Usuario canceló compartir
      }
    } else {
      handleCopyLink();
    }
  };

  const handleOpenCheckout = () => {
    if (!isAuthenticated || !user) {
      notify("Iniciar Sesión", "Inicia sesión en tu cuenta para registrar la compra de tu souvenir", "info");
      navigate(`/login?returnTo=${encodeURIComponent(`/souvenir/${id}`)}`);
      return;
    }
    setPurchaseCompleted(false);
    setPaymentFile(null);
    setIsCheckoutOpen(true);
  };

  const handleConfirmPurchase = async () => {
    if (!paymentFile) {
      notify("Comprobante requerido", "Por favor adjunta la captura o PDF de la transferencia", "warning");
      return;
    }
    setSubmitting(true);
    try {
      const totalPagar = (Number(producto.precio) * cantidad).toFixed(2);
      const formData = new FormData();
      formData.append('id_referencia', producto.id_producto);
      formData.append('tipo_referencia', 'SOUVENIR');
      formData.append('monto', totalPagar);
      formData.append('metodo_pago', 'TRANSFERENCIA');
      formData.append('notas_admin', `Compra Souvenir: ${producto.nombre} (Cantidad: ${cantidad})`);
      formData.append('file', paymentFile);

      await pagoService.uploadComprobanteOcr(formData);

      setPurchaseCompleted(true);
      notify("Compra Registrada", "Tu comprobante ha sido enviado con éxito para validación.", "success");
    } catch (err) {
      console.error("Error al registrar compra:", err);
      const msg = err.response?.data?.detail || "No se pudo registrar la compra. Inténtalo de nuevo.";
      notify("Error", msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Spinner size="large" label="Cargando souvenir oficial..." />
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Link to="/" className={styles.logoContainer}>
            <img src="/logo.png" alt="MEH Logo" className={styles.logo} />
            <span style={{ fontWeight: 'bold', fontSize: '18px' }}>Microsoft Education Hub</span>
          </Link>
        </div>
        <div className={styles.mainWrapper} style={{ alignItems: 'center', textAlign: 'center', paddingTop: '60px' }}>
          <MessageBar intent="warning" layout="multiline" style={{ maxWidth: '500px', borderRadius: '12px' }}>
            <MessageBarBody>
              ⚠️ {error || "Souvenir no encontrado"}
            </MessageBarBody>
          </MessageBar>
          <div style={{ marginTop: '20px' }}>
            <Link to="/souvenirs" style={{ textDecoration: 'none' }}>
              <MEHButton appearance="primary" icon={<ArrowLeft24Regular />}>
                Ver Catálogo de Souvenirs
              </MEHButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const stockDisponible = producto.stock || 0;
  const isAgotado = stockDisponible <= 0;
  const subtotal = (Number(producto.precio) * cantidad).toFixed(2);
  const imagenUrl = producto.imagen_url ? resolveApiFileUrl(producto.imagen_url) : DEFAULT_SOUVENIR_IMG;

  return (
    <div className={styles.container}>
      <div className={styles.glow} />

      {/* Top Navbar Luma-Style */}
      <header className={styles.header}>
        <Link to="/" className={styles.logoContainer}>
          <img src="/logo.png" alt="MEH Logo" className={styles.logo} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 'bold', fontSize: '16px', lineHeight: '1.2' }}>Microsoft Education Hub</span>
            <span style={{ fontSize: '11px', opacity: 0.7 }}>Tienda Oficial & Merch</span>
          </div>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Tooltip content="Cambiar tema" relationship="label">
            <MEHButton appearance="subtle" size="small" onClick={toggleTheme}>
              {theme === 'dark' ? <WeatherSunny24Regular /> : <WeatherMoon24Regular />}
            </MEHButton>
          </Tooltip>

          {isAuthenticated ? (
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              <MEHButton appearance="outline" size="small">Mi Dashboard</MEHButton>
            </Link>
          ) : (
            <Link to={`/login?returnTo=${encodeURIComponent(`/souvenir/${id}`)}`} style={{ textDecoration: 'none' }}>
              <MEHButton appearance="primary" size="small">Iniciar Sesión</MEHButton>
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.mainWrapper}>
        <div>
          <Link to="/souvenirs" className={styles.backLink}>
            <ArrowLeft24Regular fontSize={16} />
            <span>Volver al Catálogo de Souvenirs</span>
          </Link>
        </div>

        <div className={styles.grid}>
          {/* Columna Izquierda: Galería e Información Detallada */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className={styles.imageCard}>
              <img src={imagenUrl} alt={producto.nombre} className={styles.productImage} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <Badge appearance="filled" color="brand">
                  📦 {producto.categoria || 'SOUVENIR OFICIAL'}
                </Badge>
                {isAgotado ? (
                  <Badge appearance="filled" color="danger">Agotado Temporalmente</Badge>
                ) : (
                  <Badge appearance="tint" color="success">
                    ✓ En Stock ({stockDisponible} disponibles)
                  </Badge>
                )}
              </div>

              <MEHTypography variant="h1" style={{ margin: 0, fontSize: '32px', fontWeight: '800', lineHeight: 1.2 }}>
                {producto.nombre}
              </MEHTypography>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <span style={{ fontSize: '36px', fontWeight: '800', color: tokens.colorBrandForeground1 }}>
                  Bs. {producto.precio}
                </span>
                <span style={{ fontSize: '13px', opacity: 0.7 }}>Moneda Nacional (BOB)</span>
              </div>

              <Divider style={{ margin: '8px 0' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <MEHTypography variant="bold" style={{ fontSize: '15px' }}>Descripción del Souvenir</MEHTypography>
                <MEHTypography variant="body" style={{ opacity: 0.9, lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {producto.descripcion || 'Souvenir oficial y de edición exclusiva de la comunidad Microsoft Education Hub. Ideal para miembros, ponentes y entusiastas de la tecnología.'}
                </MEHTypography>
              </div>
            </div>

            {/* Tarjeta de Información de Entrega y Logística */}
            <div className={styles.infoCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <VehicleTruckProfile24Regular fontSize={24} style={{ color: tokens.colorBrandForeground1 }} />
                <MEHTypography variant="bold" style={{ fontSize: '15px' }}>
                  Información de Entrega y Acreditación
                </MEHTypography>
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', opacity: 0.85, fontSize: '13px', lineHeight: 1.5 }}>
                <li><b>Punto de Recojo:</b> Entrega en persona en la mesa de souvenirs / acreditación de eventos presenciales MEH.</li>
                <li><b>Entrega con tu QR:</b> Una vez verificado tu comprobante bancario, tu souvenir aparecerá en el sistema de escaneo del staff organizador para entrega inmediata al llegar.</li>
                <li><b>Garantía Comunitaria:</b> Stock verificado por los organizadores oficiales de la comunidad.</li>
              </ul>
            </div>
          </div>

          {/* Columna Derecha: Tarjeta Flotante de Compra (Luma Style) */}
          <div className={styles.stickyCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Adquirir Souvenir</span>
              <Badge appearance="outline" color={isAgotado ? 'danger' : 'success'}>
                {isAgotado ? 'Agotado' : 'Disponible'}
              </Badge>
            </div>

            {/* Selector de Cantidad */}
            {!isAgotado && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '12px', opacity: 0.8, fontWeight: '600' }}>Cantidad:</span>
                <div className={styles.quantityWrapper}>
                  <MEHButton
                    size="small"
                    appearance="outline"
                    icon={<Subtract20Regular />}
                    className={styles.qtyButton}
                    disabled={cantidad <= 1}
                    onClick={() => setCantidad(prev => Math.max(1, prev - 1))}
                  />
                  <div style={{ fontSize: '18px', fontWeight: 'bold', minWidth: '40px', textAlign: 'center' }}>
                    {cantidad}
                  </div>
                  <MEHButton
                    size="small"
                    appearance="outline"
                    icon={<Add20Regular />}
                    className={styles.qtyButton}
                    disabled={cantidad >= stockDisponible}
                    onClick={() => setCantidad(prev => Math.min(stockDisponible, prev + 1))}
                  />
                  <span style={{ fontSize: '12px', opacity: 0.6 }}>
                    (Máx: {stockDisponible})
                  </span>
                </div>
              </div>
            )}

            {/* Resumen de Monto */}
            <div style={{ padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', opacity: 0.8 }}>
                <span>Precio unitario:</span>
                <span>Bs. {producto.precio}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', opacity: 0.8 }}>
                <span>Unidades:</span>
                <span>x {cantidad}</span>
              </div>
              <Divider style={{ margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', color: tokens.colorBrandForeground1 }}>
                <span>Total a Transferir:</span>
                <span>Bs. {subtotal}</span>
              </div>
            </div>

            {/* Botón Principal de Adquisición */}
            <MEHButton
              appearance="primary"
              size="large"
              disabled={isAgotado}
              onClick={handleOpenCheckout}
              icon={<Gift24Regular />}
              style={{ width: '100%', height: '48px', fontSize: '15px', fontWeight: 'bold' }}
            >
              {isAgotado ? 'Agotado Temporalmente' : `Comprar Souvenir (Bs. ${subtotal})`}
            </MEHButton>

            {!isAuthenticated && (
              <span style={{ fontSize: '11px', textAlign: 'center', opacity: 0.7 }}>
                Al presionar, se te solicitará iniciar sesión para vincular tu compra a tu perfil.
              </span>
            )}

            {/* Sección Compartir Enlace */}
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '12px', opacity: 0.8, fontWeight: '600' }}>Compartir con amigos:</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <MEHButton
                  size="small"
                  appearance="outline"
                  icon={<Link24Regular />}
                  onClick={handleCopyLink}
                >
                  Copiar Link
                </MEHButton>
                <MEHButton
                  size="small"
                  appearance="outline"
                  icon={<Share24Regular />}
                  onClick={handleNativeShare}
                >
                  Compartir
                </MEHButton>
              </div>
              <MEHButton
                size="small"
                appearance="subtle"
                onClick={handleShareWhatsApp}
                style={{ width: '100%', color: '#25D366' }}
              >
                Compartir por WhatsApp 📱
              </MEHButton>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Pago / Checkout Bancario */}
      <Dialog open={isCheckoutOpen} onOpenChange={(e, d) => setIsCheckoutOpen(d.open)}>
        <DialogSurface style={{ backgroundColor: '#17171C', border: '1px solid rgba(127, 19, 236, 0.3)', borderRadius: '20px', maxWidth: '480px', width: '100%', padding: '16px' }}>
          <DialogBody>
            <DialogTitle>
              {purchaseCompleted ? "¡Compra Registrada con Éxito!" : "Adquirir Souvenir Oficial"}
            </DialogTitle>
            
            <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
              {purchaseCompleted ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px', padding: '16px 0' }}>
                  <CheckmarkCircle24Filled fontSize={56} style={{ color: tokens.colorPaletteGreenForeground1 }} />
                  <MEHTypography variant="h3">¡Comprobante Enviado!</MEHTypography>
                  <MEHTypography variant="body" style={{ opacity: 0.9, fontSize: '13px', lineHeight: 1.5 }}>
                    Hemos recibido tu comprobante de <b>Bs. {subtotal}</b> por <b>{cantidad}x {producto.nombre}</b>. Nuestro equipo administrativo validará tu transferencia bancaria.
                  </MEHTypography>
                  <MessageBar intent="info" layout="multiline" style={{ borderRadius: '10px', width: '100%', marginTop: '8px' }}>
                    <MessageBarBody>
                      🏷️ Tu souvenir quedará vinculado a tu cuenta. Podrás retirarlo directamente mostrando tu QR o nombre en el módulo de souvenirs del evento.
                    </MessageBarBody>
                  </MessageBar>
                </div>
              ) : (
                <>
                  <div style={{ padding: '12px 16px', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{producto.nombre}</div>
                    <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px' }}>
                      Cantidad: <b>{cantidad}</b> • Total: <b style={{ color: tokens.colorBrandForeground1 }}>Bs. {subtotal}</b>
                    </div>
                  </div>

                  {/* QR Bancario Oficial */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <span style={{ fontSize: '12px', opacity: 0.85, fontWeight: 'bold' }}>
                      1. Transfiere exactamente Bs. {subtotal} con QR Bancario:
                    </span>
                    <div style={{ padding: '12px', backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 6px 16px rgba(0,0,0,0.3)' }}>
                      <QRCodeSVG
                        value={`MEH_PAGO_SOUVENIR_${producto.id_producto}_TOTAL_${subtotal}`}
                        size={170}
                        level="H"
                        includeMargin={false}
                      />
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '11px', opacity: 0.75 }}>
                      Comunidad Microsoft Education Hub • Banco Unión / Simple QR
                    </div>
                  </div>

                  {/* Subida de Comprobante */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: 'bold' }}>2. Sube la captura de tu transferencia:</span>
                      {paymentFile && (
                        <Badge appearance="tint" color="success">Listo ({(paymentFile.size / 1024).toFixed(0)} KB)</Badge>
                      )}
                    </div>

                    <div className={styles.uploadArea}>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className={styles.fileInput}
                        onChange={(e) => setPaymentFile(e.target.files[0] || null)}
                      />
                      <ReceiptMoney24Filled fontSize={28} style={{ opacity: 0.8, color: tokens.colorBrandForeground1, margin: '0 auto 6px auto', display: 'block' }} />
                      <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'block' }}>
                        {paymentFile ? `✓ ${paymentFile.name}` : "Toca aquí para seleccionar captura o PDF"}
                      </span>
                      <span style={{ fontSize: '11px', opacity: 0.7 }}>
                        Formatos válidos: JPG, PNG, PDF
                      </span>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>

            <DialogActions style={{ marginTop: '16px' }}>
              {purchaseCompleted ? (
                <MEHButton appearance="primary" onClick={() => setIsCheckoutOpen(false)}>
                  Cerrar
                </MEHButton>
              ) : (
                <>
                  <MEHButton appearance="outline" onClick={() => setIsCheckoutOpen(false)}>
                    Cancelar
                  </MEHButton>
                  <MEHButton
                    appearance="primary"
                    disabled={!paymentFile || submitting}
                    loading={submitting}
                    onClick={handleConfirmPurchase}
                  >
                    Confirmar Pago de Bs. {subtotal}
                  </MEHButton>
                </>
              )}
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};

export default SouvenirPublico;
