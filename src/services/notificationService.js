import { api } from './api';

export const notificationService = {
  // Obtener productos con stock bajo
  getLowStockAlerts: async (threshold = 10) => {
    try {
      const products = await api.get('/inventario');
      
      // Filtrar productos con stock <= threshold pero > 0
      const lowStockProducts = products.filter(product => 
        parseInt(product.stock) <= threshold && parseInt(product.stock) > 0
      );
      
      // Filtrar productos sin stock
      const outOfStockProducts = products.filter(product => 
        parseInt(product.stock) === 0
      );
      
      // Crear notificaciones de stock bajo
      const lowStockNotifications = lowStockProducts.map(product => ({
        id: `low-stock-${product.id}`,
        type: 'warning',
        title: 'Stock Bajo',
        message: `${product.nombre} tiene solo ${product.stock} unidades`,
        time: 'Ahora',
        icon: 'fas fa-exclamation-triangle',
        product: product,
        priority: 2
      }));
      
      // Crear notificaciones de sin stock
      const outOfStockNotifications = outOfStockProducts.map(product => ({
        id: `out-of-stock-${product.id}`,
        type: 'danger',
        title: 'Sin Stock',
        message: `${product.nombre} se ha agotado`,
        time: 'Ahora',
        icon: 'fas fa-times-circle',
        product: product,
        priority: 1
      }));
      
      // Combinar y ordenar por prioridad (sin stock primero)
      const allNotifications = [...outOfStockNotifications, ...lowStockNotifications]
        .sort((a, b) => a.priority - b.priority);
      
      return {
        notifications: allNotifications,
        count: allNotifications.length,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length
      };
      
    } catch (error) {
      console.error('Error al obtener alertas de stock:', error);
      return {
        notifications: [],
        count: 0,
        lowStockCount: 0,
        outOfStockCount: 0
      };
    }
  },

  // Obtener alertas críticas (solo sin stock)
  getCriticalAlerts: async () => {
    try {
      const products = await api.get('/inventario');
      
      const criticalProducts = products.filter(product => 
        parseInt(product.stock) === 0
      );
      
      return {
        products: criticalProducts,
        count: criticalProducts.length
      };
    } catch (error) {
      console.error('Error al obtener alertas críticas:', error);
      return { products: [], count: 0 };
    }
  },

  // Configurar umbral personalizado
  getCustomThresholdAlerts: async (customThreshold) => {
    return await notificationService.getLowStockAlerts(customThreshold);
  }
};