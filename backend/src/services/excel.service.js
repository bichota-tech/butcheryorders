import ExcelJS from 'exceljs'

export const generateOrdersExcel = async (orders) => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Pedidos')

    // Define columns
    worksheet.columns = [
        { header: 'Nº Pedido', key: 'id', width: 20 },
        { header: 'Cliente', key: 'userName', width: 25 },
        { header: 'Email', key: 'userEmail', width: 25 },
        { header: 'Fecha', key: 'createdAt', width: 20 },
        { header: 'Estado', key: 'status', width: 15 },
        { header: 'Total (€)', key: 'total', width: 15 },
        { header: 'Productos', key: 'items', width: 50 },
        { header: 'Transcripción Original', key: 'transcript', width: 40 }
    ]

    // Style header
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
    }

    // Add rows
    orders.forEach(order => {
        const itemsList = order.items.map(item =>
            `${item.quantity} ${item.unit} ${item.product?.name || item.productName || 'Desconocido'}`
        ).join('; ')

        worksheet.addRow({
            id: order.id.substring(0, 8),
            userName: order.user?.name || 'Invitado',
            userEmail: order.user?.email || 'N/A',
            createdAt: new Date(order.createdAt).toLocaleString(),
            status: order.status,
            total: order.totalAmount,
            items: itemsList,
            transcript: order.transcript || ''
        })
    })

    return workbook
}
