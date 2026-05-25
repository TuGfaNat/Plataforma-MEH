---
title: Comprar Souvenirs
sidebar_label: Comprar Souvenirs
---

# Comprar Souvenirs

Visita la tienda oficial de Microsoft Education Hub para adquirir merchandising, remeras y kits tecnológicos de los eventos.

### Paso a Paso para la Adquisición:
1. En la barra lateral izquierda, selecciona la sección **Comunidad** y luego haz clic en **Tienda de Souvenirs**.
2. Explora el catálogo de productos disponibles con sus precios en Bolivianos (Bs.) y el stock físico en vivo.
3. Haz clic en **Comprar** sobre el producto de tu interés.
4. Se abrirá la pasarela de depósito bancario local:
   * Sube la foto del comprobante de transferencia por el valor exacto del producto.
   * Introduce el número de referencia transaccional.
5. Haz clic en **Finalizar Pedido**.
6. El estado del pedido se actualizará en tu panel financiero y podrás retirar el souvenir en las oficinas del Hub de la facultad una vez que el administrador valide tu depósito bancario.

:::caution 📷 ACCIÓN REQUERIDA: CAPTURA DE PANTALLA
**Nombre de Archivo a Guardar:** `img/img_tienda_souvenirs.png`  
**Instrucciones de Captura:** Captura de la interfaz de la tienda virtual de souvenirs en Fluent UI v9, mostrando la cuadrícula de productos con sus precios en bolivianos, stock actual y el botón de compra interactivo. Guardar la imagen en `website/static/img/img_tienda_souvenirs.png`.
:::

![Tienda Virtual de Souvenirs](/img/img_tienda_souvenirs.png)

---

### ⚠️ Reglas de Inventario y Stock
* El sistema relacional PostgreSQL tiene restricciones físicas que impiden compras si el stock del producto es inferior a 1.
* Los precios de venta deben ser estrictamente positivos en bolivianos.
