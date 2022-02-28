const printInvoice = (obj, params={_id:null , order:null , import:null}) => {
    const invoiceQuery = {
        _id: $(obj).attr("invoiceID") || params._id || null,
        data: $(obj).attr("orderID") || params.order  || $(obj).attr("importID") || params.import || null,
    }
    if(invoiceQuery._id == null){
        delete invoiceQuery._id
    }
    if(invoiceQuery.data == null){
        delete invoiceQuery.data
    }

    var queryString = Object.keys(invoiceQuery).map(key => key + '=' + invoiceQuery[key]).join('&');

    const newWindow = window.open(`${window.location.origin}/invoice/print?${queryString}`, 'hhgh', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
    newWindow.onload = function (e) {
       setTimeout(function name(params) {
        newWindow.print()
       },1000)
    
    }
    newWindow.onafterprint = () => {
        newWindow.close()
        window.location = window.location.href
    }

}

const linkPrintInvoiceEventTrigger = () => {

    $('.printInvoice').on('click', function (e) {
        e.preventDefault();
        printInvoice(this)

    })

}

linkPrintInvoiceEventTrigger()
