
// Class definition
var KTModalImportEdit = function () {
    var submitButton;
    var cancelButton;
    var closeButton;
    var validator;
    var form;
    let importID
    let importData = {
        productCategories: [],
        totalProductCategoriesPrice: 0,
        discount: 0,
        paidAmount: 0,
        totalPrice: 0,
        moneyBack: 0
    }

    // Init form inputs
    var handleForm = function () {
        // Init form validation rules. For more info check the FormValidation plugin's official documentation:https://formvalidation.io/
        const checkValidPaidAmount = function () {
            return {
                validate: function (input) {
                    const value = input.value;
                    const supplier = $('select[name="edit_supplier"]').val()

                    if (supplier !== 'public' && value > importData.totalPrice) {
                        return {
                            valid: false,
                        };
                    } else {
                        return {
                            valid: true,
                        };
                    }


                },
            };
        };

        const checkValidDiscount = function () {
            return {
                validate: function (input) {
                    const value = input.value;
                    const supplier = $('select[name="edit_supplier"]').val()
                    console.log('----------------------');
                    console.log(value, importData.totalProductCategoriesPrice);

                    if (value > importData.totalProductCategoriesPrice) {
                        return {
                            valid: false,
                        };
                    } else {
                        return {
                            valid: true,
                        };
                    }


                },
            };
        };


        FormValidation.validators.checkValidPaidAmount = checkValidPaidAmount
        FormValidation.validators.checkValidDiscount = checkValidDiscount

        validator = FormValidation.formValidation(
            form,
            {
                fields: {
                    'edit_paid_amount': {
                        validators: {
                            checkValidPaidAmount: {
                                message: 'لا يمكن ان يتجاوز المطلوب للدفع'
                            }
                        }
                    },
                    'edit_discount': {
                        validators: {
                            checkValidDiscount: {
                                message: ' لا يمكن أن يتجاوز الخصم المبلغ الإجمالي'
                            }
                        }
                    }
                },
                plugins: {
                    trigger: new FormValidation.plugins.Trigger(),
                    bootstrap: new FormValidation.plugins.Bootstrap5({
                        rowSelector: '.fv-row',
                        eleInvalidClass: '',
                        eleValidClass: ''
                    })
                }
            }
        );/*

		// Revalidate country field. For more info, plase visit the official plugin site: https://select2.org/
        $(form.querySelector('[name="country"]')).on('change', function() {
            // Revalidate the field when an option is chosen
            validator.revalidateField('country');
        });
        */
        // Action buttons
        submitButton.addEventListener('click', function (e) {
            e.preventDefault();

            // Validate form before submit
            if (validator) {
                validator.validate().then(function (status) {
                    console.log('validated!');

                    if (status == 'Valid') {
                        submitButton.setAttribute('data-kt-indicator', 'on');

                        // Disable submit button whilst loading
                        submitButton.disabled = true;
                        const payload = {
                            ...importData
                        }
                        console.log(importData);

                        $.post(`/import/edit/${importID}`, { payload: JSON.stringify(payload) }).then(recipientID => {
                            submitButton.removeAttribute('data-kt-indicator');

                            Swal.fire({
                                text: "تم تعديل التوريد بنجاح!",
                                icon: "success",
                                buttonsStyling: false,
                                confirmButtonText: "حسنا",
                                customClass: {
                                    confirmButton: "btn btn-primary"
                                }
                            }).then(function (result) {
                                if (result.isConfirmed) {
                                    // Hide modal

                                    // Enable submit button after loading
                                    submitButton.disabled = false;
                                    window.location = '/import/new'

                                }
                            })
                        }).catch(err => {
                            Swal.fire({
                                text: errDisplay(err),
                                icon: "error",
                                buttonsStyling: false,
                                confirmButtonText: "حسنا",
                                customClass: {
                                    confirmButton: "btn btn-primary"
                                }
                            });

                            submitButton.removeAttribute('data-kt-indicator');
                            submitButton.disabled = false;


                        })

                    } else {
                        Swal.fire({
                            text: "حصل خطأ ما ، يرجى المحاولة مرة أخرى!",
                            icon: "error",
                            buttonsStyling: false,
                            confirmButtonText: "حسنا",
                            customClass: {
                                confirmButton: "btn btn-primary"
                            }
                        });
                        submitButton.removeAttribute('data-kt-indicator');

                    }
                });
            }
        });

        cancelButton.addEventListener('click', function (e) {
            e.preventDefault();

            Swal.fire({
                text: "هل تريد إلغاء العملية ؟",
                icon: "warning",
                showCancelButton: true,
                buttonsStyling: false,
                confirmButtonText: "نعم",
                cancelButtonText: "لا",
                customClass: {
                    confirmButton: "btn btn-primary",
                    cancelButton: "btn btn-active-light"
                }
            }).then(function (result) {
                if (result.value) {
                    form.reset(); // Reset form	
                    // modal.hide(); // Hide modal	
                    window.location = '/import/new'
                } else if (result.dismiss === 'cancel') {
                    Swal.fire({
                        text: "لم يتم إلغاء نموذج الإضافة!",
                        icon: "error",
                        buttonsStyling: false,
                        confirmButtonText: "حسنا",
                        customClass: {
                            confirmButton: "btn btn-primary",
                        }
                    });
                }
            });
        });

        $('#edit_productCategories_serial_Number').on('keyup', async function (event) {
            if (event.which === 13) {
                event.preventDefault();
                const val = $(this).val().trim()
                const productCategory = await getProductCategoryBySerialNumber(val)
                if (!productCategory) {
                    return
                }
                addProductCategory(productCategory)
                $(this).val('')
            }

        })
        $('#edit_productCategories').on('change', async function (event) {
            const val = $(this).val().trim()
            const productCategory = await getProductCategoryBySerialNumber(val)
            if (!productCategory) {
                return
            }
            addProductCategory(productCategory)
            $(this).val('')
        })
        $('#edit_discount').on('change keyup', function (e) {
            const val = $(this).val().trim()
            importData.discount = val
            updateImportResult()
        })

        $('#edit_paid_amount').on('change keyup', function (e) {
            const val = $(this).val().trim()
            importData.paidAmount = val
            importData.moneyBack = importData.totalPrice - importData.paidAmount
            updateImportResult()
        })

        const getProductCategoryBySerialNumber = async (serialNumber = 00000000) => {
            const res = await fetch(`/productCategory/get?serialNumber=${serialNumber}`)
            const data = await res.json()
            return data.productCategory
        }


    }
    var deleteCustomField = function () {
        $('.edit_delete_row').on('click', function (e) {
            e.preventDefault();

            // Select parent row
            const row = e.target.closest('tr');
            console.log(row);

            // SweetAlert2 pop up --- official docs reference: https://sweetalert2.github.io/

            Swal.fire({
                text: "هل تريد حذف المنتج ؟",
                icon: "warning",
                showCancelButton: true,
                buttonsStyling: false,
                confirmButtonText: "نعم",
                cancelButtonText: "لا",
                customClass: {
                    confirmButton: "btn fw-bold btn-danger",
                    cancelButton: "btn fw-bold btn-active-light-primary"
                }
            }).then(function (result) {
                if (result.value) {
                    // Remove current row
                    const rowId = $(row).attr("id")
                    console.log(rowId);
                    const index = rowId.split('-')[2]

                    importData.productCategories.splice(index, 1)
                    $(`#${rowId}`).remove();

                    $('#edit_import_tbody > tr').each(function (index, tr) {
                        $(this).attr("id", `edit-item-${index}`)
                    });
                    updateImportResult()

                    Swal.fire({
                        text: "تم الحذف بنجاح.",
                        icon: "success",
                        buttonsStyling: false,
                        confirmButtonText: "موافق",
                        customClass: {
                            confirmButton: "btn fw-bold btn-primary",
                        }
                    })
                } else if (result.dismiss === 'cancel') {
                    Swal.fire({
                        text: "لم يتم الحذف بنجاح",
                        icon: "error",
                        buttonsStyling: false,
                        confirmButtonText: "حسناً",
                        customClass: {
                            confirmButton: "btn fw-bold btn-primary",
                        }
                    })
                }
            });
        });
    }

    const updateRow = (index) => {
        const row = $(`#edit-item-${index}`)

        const productCategory = importData.productCategories[index]

        $(`#edit-qty-${productCategory._id}`).val(productCategory.qty)
        $(`#edit-costPrice-${productCategory._id}`).val(productCategory.costPrice)
        $(`#edit-sellingPrice-${productCategory._id}`).val(productCategory.sellingPrice)
        $(`#edit-totalPrice-${productCategory._id}`).html(productCategory.totalPrice)
        updateImportResult()
    }
    const linkEventTrigger = () => {
        $('.edit_productCategoryQty').on('change keyup', async function (event) {
            const val = $(this).val().trim()
            const id = $(this).attr("id").split('-')[2]
            const productCategoryIndex = importData.productCategories.findIndex(productCategory => productCategory._id == id)
            importData.productCategories[productCategoryIndex].qty = Number(val)
            importData.productCategories[productCategoryIndex].totalPrice = importData.productCategories[productCategoryIndex].qty * importData.productCategories[productCategoryIndex].costPrice
            updateRow(productCategoryIndex)
        })

        $('.edit_productCategoryCostPrice').on('change keyup', async function (event) {
            const val = $(this).val().trim()
            const id = $(this).attr("id").split('-')[2]
            const productCategoryIndex = importData.productCategories.findIndex(productCategory => productCategory._id == id)
            importData.productCategories[productCategoryIndex].costPrice = Number(val)
            importData.productCategories[productCategoryIndex].totalPrice = importData.productCategories[productCategoryIndex].qty * val
            updateRow(productCategoryIndex)
        })

        $('.edit_productCategorySellingPrice').on('change keyup', async function (event) {
            const val = $(this).val().trim()
            const id = $(this).attr("id").split('-')[2]
            const productCategoryIndex = importData.productCategories.findIndex(productCategory => productCategory._id == id)
            importData.productCategories[productCategoryIndex].sellingPrice = Number(val)
        })


        deleteCustomField()

    }
    const addProductCategory = (productCategory) => {
        const existIndex = importData.productCategories.findIndex(prod => prod._id == productCategory._id)
        if (existIndex >= 0) {
            importData.productCategories[existIndex].qty++
            importData.productCategories[existIndex].totalPrice += productCategory.costPrice
            updateRow(existIndex)
            return
        }
        const newProductCategory = {
            _id: productCategory._id,
            name: `${productCategory.name} - ${productCategory.unit.title}`,
            qty: 1,
            costPrice: productCategory.costPrice,
            sellingPrice: productCategory.sellingPrice,
            totalPrice: productCategory.costPrice,
        }

        importData.productCategories.push(newProductCategory)
        updateImportResult()

        const tr = document.createElement('tr')
        tr.setAttribute("id", `edit-item-${importData.productCategories.indexOf(newProductCategory)}`);

        tr.innerHTML = `
        <td>${newProductCategory.name}</td>
        <td><input type="number" class="form-control form-control-solid edit_productCategoryQty" id="edit-qty-${newProductCategory._id}" value="${newProductCategory.qty}" min="1"></td>
        <td><input type="number" class="form-control form-control-solid edit_productCategoryCostPrice" id="edit-costPrice-${newProductCategory._id}" value="${newProductCategory.costPrice}" min="1"></td>
        <td><input type="number" class="form-control form-control-solid edit_productCategorySellingPrice" id="edit-sellingPrice-${newProductCategory._id}" value="${newProductCategory.sellingPrice}" min="1"></td>
        <td id="edit-totalPrice-${newProductCategory._id}">${newProductCategory.totalPrice}</td>
        <td><button type="button" class="btn btn-icon btn-flex btn-active-light-primary w-30px h-30px me-3 edit_delete_row" >
        <!--begin::Svg Icon | path: icons/duotune/general/gen027.svg-->
        <span class="svg-icon svg-icon-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 9C5 8.44772 5.44772 8 6 8H18C18.5523 8 19 8.44772 19 9V18C19 19.6569 17.6569 21 16 21H8C6.34315 21 5 19.6569 5 18V9Z" fill="black"></path>
                <path opacity="0.5" d="M5 5C5 4.44772 5.44772 4 6 4H18C18.5523 4 19 4.44772 19 5V5C19 5.55228 18.5523 6 18 6H6C5.44772 6 5 5.55228 5 5V5Z" fill="black"></path>
                <path opacity="0.5" d="M9 4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V4H9V4Z" fill="black"></path>
            </svg>
        </span>
        <!--end::Svg Icon-->
        </button></td>`
        console.log(form);
        form.querySelector('#edit_import_tbody').appendChild(tr);

        linkEventTrigger()
       

    }
    const claTotalProductCategoriesPrice = () => {
        const total = importData.productCategories.reduce((acc, productCategory) => acc + productCategory.totalPrice, 0)
        return total
    }
    const updateImportResult = () => {
        const totalProductCategoriesPrice = claTotalProductCategoriesPrice()
        importData.totalProductCategoriesPrice = totalProductCategoriesPrice
        $('#edit_total_price_result').html(`${totalProductCategoriesPrice} شيكل`)

        const discount = importData.discount
        $('#edit_discount_amount_result').html(`${discount} شيكل`)


        const paid_amount = importData.paidAmount
        $('#edit_paid_amount_result').html(`${paid_amount} شيكل`)



        const totalAmount = totalProductCategoriesPrice - discount
        importData.totalPrice = totalAmount
        $('#edit_total_amount_result').html(`${totalAmount} شيكل`)

        const paid_amount_back = paid_amount - totalAmount
        importData.moneyBack = paid_amount_back
        $('#edit_paid_amount_back_result').html(`${paid_amount_back} شيكل`)
    }
    // Delete productCategories


    return {
        // Public functions
        init: function () {
            // Elements

            form = document.querySelector('#kt_modal_edit_import_form');
            submitButton = form.querySelector('#kt_modal_edit_import_submit');
            cancelButton = form.querySelector('#kt_modal_edit_import_cancel');
            const displayImport = (data) => {
                const { importd } = data
                console.log(importd);
                importData = importd
                const table = importData.productCategories.map((productCategories, index) => {

                    return `<tr id='edit-item-${index}' ><td>${productCategories.name}</td>
                    <td><input type="number" class="form-control form-control-solid edit_productCategoryQty" id="edit-qty-${productCategories._id}" value="${productCategories.qty}" min="1"></td>
                    <td><input type="number" class="form-control form-control-solid edit_productCategoryCostPrice" id="edit-costPrice-${productCategories._id}" value="${productCategories.costPrice}" min="1"></td>
                    <td><input type="number" class="form-control form-control-solid edit_productCategorySellingPrice" id="edit-sellingPrice-${productCategories._id}" value="${productCategories.sellingPrice}" min="1"></td>
                    <td id="edit-totalPrice-${productCategories._id}">${productCategories.totalPrice}</td>
                    <td><button type="button" class="btn btn-icon btn-flex btn-active-light-primary w-30px h-30px me-3 edit_delete_row" >
                    <!--begin::Svg Icon | path: icons/duotune/general/gen027.svg-->
                    <span class="svg-icon svg-icon-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M5 9C5 8.44772 5.44772 8 6 8H18C18.5523 8 19 8.44772 19 9V18C19 19.6569 17.6569 21 16 21H8C6.34315 21 5 19.6569 5 18V9Z" fill="black"></path>
                            <path opacity="0.5" d="M5 5C5 4.44772 5.44772 4 6 4H18C18.5523 4 19 4.44772 19 5V5C19 5.55228 18.5523 6 18 6H6C5.44772 6 5 5.55228 5 5V5Z" fill="black"></path>
                            <path opacity="0.5" d="M9 4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V4H9V4Z" fill="black"></path>
                        </svg>
                    </span>
                    <!--end::Svg Icon-->
                    </button></td></tr>`
                }).join('')
                $('#edit_import_tbody').html(table)
                $('#edit_supplier').val(importData.supplier.name)
                $('#edit_supplier').attr('supplierID', importData.supplier._id)

                updateImportResult()
                linkEventTrigger()

            }
            const getImportByInvoiceSerialNumber = async (serial) => {
                const res = await fetch(`/invoice/import/get?serialNumber=${serial}`)
                const data = await res.json()
                return data
            }

            $('#edit_import_serial_number').on('keyup', async function (event) {
                if (event.which === 13) {
                    event.preventDefault();
                    const val = $(this).val().trim()
                    let data = await getImportByInvoiceSerialNumber(val)
                    if (!data.success) {
                        Swal.fire({
                            text: data.message,
                            icon: "error",
                            buttonsStyling: false,
                            confirmButtonText: "حسنا",
                            customClass: {
                                confirmButton: "btn btn-primary"
                            }
                        }).then(function (result) {
                            if (result.isConfirmed) {
                                // Hide modal

                                // Enable submit button after loading
                                submitButton.disabled = false;

                            }
                        })
                        $(this).val('')

                    } else {
                        $(this).val('')
                        $('#editImport').removeClass('d-none')
                        importID = data.importd._id
                        handleForm();

                        displayImport(data)
                        linkEventTrigger()
                    }


                }

            })



        }
    };
}();




$(document).ready(function () {
    $('#edit_productCategories_serial_Number').focus()
    $(window).keydown(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });
});


// On document ready
KTUtil.onDOMContentLoaded(function () {

    KTModalImportEdit.init();
});

