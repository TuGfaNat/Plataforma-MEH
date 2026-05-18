\# 🛠️ SPEC: PROTOCOLO DE RESOLUCIÓN DE ERRORES (CRITICAL DEBUG)



\## 1. METODOLOGÍA DE REPARACIÓN: "AISLAR Y VENCER"

Para evitar la sobrecarga de procesamiento y errores en cadena, la IA debe seguir este flujo estrictamente:

1\. \*\*Identificación:\*\* Leer el error específico de la consola (Browser o Terminal).

2\. \*\*Aislamiento:\*\* Localizar el archivo y la línea exacta. No modificar otros archivos a menos que sea estrictamente necesario por dependencias.

3\. \*\*Reproducción:\*\* Entender qué acción del usuario dispara el error.

4\. \*\*Fix Atómico:\*\* Aplicar la corrección mínima necesaria para eliminar el error sin alterar la lógica de negocio.



\## 2. CATEGORIZACIÓN DE ERRORES (Prioridad)

| Nivel | Tipo de Error | Acción Requerida |

| :--- | :--- | :--- |

| \*\*P1\*\* | \*\*Crash/White Screen\*\* | Revisar `Imports`, `Hooks` mal usados o `Maps` de datos nulos. |

| \*\*P2\*\* | \*\*Data Binding (Swagger/API)\*\* | Revisar `Payloads`, `Headers` de Auth y estructura del JSON. |

| \*\*P3\*\* | \*\*Layout/Responsive\*\* | Revisar `Tailwind Classes`, `Z-index` y desbordamientos (Overflow). |

| \*\*P4\*\* | \*\*Lógica/i18n\*\* | Revisar archivos de traducción y estados de `i18next`. |



\## 3. REGLAS DE ORO PARA LA IA

\*   \*\*No Refactorizar:\*\* Si el código funciona pero tiene un error pequeño, arregla el error. \*\*PROHIBIDO\*\* reescribir el componente entero a menos que sea la causa del crash.

\*   \*\*Logs Limpios:\*\* Insertar `console.log()` temporales para rastrear el flujo de datos y eliminarlos una vez resuelto el problema.

\*   \*\*Validación de Nulos:\*\* Antes de mapear cualquier dato del backend (especialmente en SMAU\_MOF o MEH), verificar siempre la existencia del objeto mediante Optional Chaining: `data?.property || \[]`.

\*   \*\*Contexto Persistente:\*\* Antes de proponer una solución, verificar si el cambio afecta al `Sidebar` o al `AuthContext`.



\## 4. FORMATO DE REPORTE DE SOLUCIÓN

Cada vez que la IA resuelva un error, debe indicar:

\*   \*\*Archivo:\*\* `path/to/file.tsx`

\*   \*\*Causa:\*\* Breve descripción del porqué fallaba.

\*   \*\*Solución:\*\* Bloque de código corregido.

\*   \*\*Efecto:\*\* Qué otra parte del sistema se ve afectada (si aplica).

