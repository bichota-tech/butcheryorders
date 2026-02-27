import ExcelJS from 'exceljs'

export const generateOrdersExcel = async (orders) => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Pedidos')

    // Define columns per user specification
    worksheet.columns = [
        { header: 'Nº Pedido', key: 'id', width: 15 },
        { header: 'Cliente', key: 'clientName', width: 25 },
        { header: 'Teléfono', key: 'clientPhone', width: 18 },
        { header: 'Fecha Pedido', key: 'createdAt', width: 20 },
        { header: 'Estado', key: 'status', width: 15 },
        { header: 'Fecha Recogida', key: 'pickupDate', width: 20 },
        { header: 'Productos', key: 'items', width: 50 }
    ]

    // Style header
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
    }
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }

    // Status map
    const statusMap = {
        'PENDING': 'Pendiente',
        'CONFIRMED': 'Confirmado',
        'COMPLETED': 'Completado',
        'CANCELLED': 'Cancelado'
    }

    // Add rows
    orders.forEach(order => {
        const itemsList = order.items.map(item =>
            `${item.quantity} ${item.unit} ${item.product?.name || 'Desconocido'}`
        ).join('; ')

        worksheet.addRow({
            id: order.id.substring(0, 8).toUpperCase(),
            clientName: order.clientName || '-',
            clientPhone: order.clientPhone || '-',
            createdAt: new Date(order.createdAt).toLocaleDateString('es-ES', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
            }),
            status: statusMap[order.status] || order.status,
            pickupDate: order.pickupDate
                ? new Date(order.pickupDate).toLocaleDateString('es-ES', {
                    day: '2-digit', month: '2-digit', year: 'numeric'
                })
                : '-',
            items: itemsList
        })
    })

    // Auto-filter
    worksheet.autoFilter = {
        from: 'A1',
        to: `G${orders.length + 1}`
    }

    return workbook
}
