"use strict";
// Class definition
var KTModalProductCategoryEdit = function () {
    var submitButton;
    var cancelButton;
    var closeButton;
    var validator;
    var form;
    var modal;
    let productID

    let isWeightUnit = false
    let internalProductSerialNumber = false


    // Init form inputs
    var handleForm = function () {
        // Init form validation rules. For more info check the FormValidation plugin's official documentation:https://formvalidation.io/

        const checkIfProductSerialNumberRequired = function () {
            return {
                validate: function (input) {
                    const value = input.value;
                    if (!addProduct) {
                        return {
                            valid: true,
                        };
                    } else if (internalProductSerialNumber) {
                        return {
                            valid: true,
                        };
                    } else if (value.length > 0) {
                        return {
                            valid: true,
                        };
                    } else {
                        return {
                            valid: false,
                        };
                    }
                },
            };
        };

        const checkIfProductSellingPriceRequired = function () {
            return {
                validate: function (input) {
                    const value = input.value;
                    if (!addProduct) {
                        return {
                            valid: true,
                        };
                    } else if (isWeightUnit) {
                        return {
                            valid: true,
                        };
                    } else if (value.length > 0) {
                        return {
                            valid: true,
                        };
                    } else {
                        return {
                            valid: false,
                        };
                    }
                },
            };
        };


        FormValidation.validators.checkIfProductSerialNumberRequired = checkIfProductSerialNumberRequired;
        FormValidation.validators.checkIfProductSellingPriceRequired = checkIfProductSellingPriceRequired;


        validator = FormValidation.formValidation(
            form,
            {
                fields: {
                  
                    'productCategory': {
                        validators: {
                            notEmpty: {
                                message: '?????? ?????????? ??????????.'
                            }

                        }
                    },
                    'productSerialNumber': {
                        validators: {
                            checkIfProductCategorySerialNumberRequired: {
                                message: '???????????????? ???????? ?????????? ??????????.'
                            }

                        }
                    },
                    'ratioPerUnit': {
                        validators: {
                            notEmpty: {
                                message: '???????????? ?????????????? ???????????? ?????????????? ???????????? ??????????.'
                            }

                        }
                    }
                    ,
                    'price': {
                        validators: {
                            notEmpty: {
                                message: '?????? ?????????? ???????????? ??????????.'
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
                            productCategory: $("select[name=productCategory]").val(),
                            productSerialNumber: $("input[name=productSerialNumber]").val(),

                            ratioPerUnit: $("input[name=ratioPerUnit]").val(),
                            price: $("input[name=price]").val(),

                            configs: {
                                internalProductSerialNumber,
                                isWeightUnit
                            }

                        }

                        $.post('/product/new', { payload: JSON.stringify(payload) }).then(recipientID => {
                            submitButton.removeAttribute('data-kt-indicator');

                            Swal.fire({
                                text: "???? ?????????? ???????????? ??????????!",
                                icon: "success",
                                buttonsStyling: false,
                                confirmButtonText: "????????",
                                customClass: {
                                    confirmButton: "btn btn-primary"
                                }
                            }).then(function (result) {
                                if (result.isConfirmed) {
                                    // Hide modal
                                    modal.hide();

                                    // Enable submit button after loading
                                    submitButton.disabled = false;
                                    window.location = '/products/page/get'

                                }
                            })
                        }).catch(err => {
                            Swal.fire({
                                text: errDisplay(err),
                                icon: "error",
                                buttonsStyling: false,
                                confirmButtonText: "????????",
                                customClass: {
                                    confirmButton: "btn btn-primary"
                                }
                            });

                            submitButton.removeAttribute('data-kt-indicator');
                            submitButton.disabled = false;
                        })

                    } else {
                        Swal.fire({
                            text: "?????? ?????? ???? ?? ???????? ???????????????? ?????? ????????!",
                            icon: "error",
                            buttonsStyling: false,
                            confirmButtonText: "????????",
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
                text: "???? ???????? ?????????? ?????????????? ??",
                icon: "warning",
                showCancelButton: true,
                buttonsStyling: false,
                confirmButtonText: "??????",
                cancelButtonText: "????",
                customClass: {
                    confirmButton: "btn btn-primary",
                    cancelButton: "btn btn-active-light"
                }
            }).then(function (result) {
                if (result.value) {
                    form.reset(); // Reset form	
                    modal.hide(); // Hide modal	
                    window.location = `/products/page/get`
                } else if (result.dismiss === 'cancel') {
                    Swal.fire({
                        text: "???? ?????? ?????????? ?????????? ??????????????!",
                        icon: "error",
                        buttonsStyling: false,
                        confirmButtonText: "????????",
                        customClass: {
                            confirmButton: "btn btn-primary",
                        }
                    });
                }
            });
        });

        closeButton.addEventListener('click', function (e) {
            e.preventDefault();

            Swal.fire({
                text: "???? ?????? ?????????? ???? ?????????? ?????????????? ??",
                icon: "warning",
                showCancelButton: true,
                buttonsStyling: false,
                confirmButtonText: "??????",
                cancelButtonText: "????",
                customClass: {
                    confirmButton: "btn btn-primary",
                    cancelButton: "btn btn-active-light"
                }
            }).then(function (result) {
                if (result.value) {
                    form.reset(); // Reset form	
                    modal.hide(); // Hide modal	
                    window.location = `/products/page/get`


                } else if (result.dismiss === 'cancel') {
                    Swal.fire({
                        text: "???? ?????? ?????????? ??????????????!",
                        icon: "error",
                        buttonsStyling: false,
                        confirmButtonText: "????????",
                        customClass: {
                            confirmButton: "btn btn-primary",
                        }
                    });
                }
            });
        })


    

        $('#productSerialNumberBtn').on('change', function (e) {
            if (this.checked) {
                $('#productSerialNumberBlock').addClass('d-none')
                internalProductSerialNumber = true
            } else {
                $('#productSerialNumberBlock').removeClass('d-none')
                internalProductSerialNumber = true
            }
        })

        $('#addProduct').on('click', async function (e) {
            const productCategoryLabel = $('#productCategoryUnitSmallTitle')
            const getProductCategoryUnit = async (productCategoryID) => {
                const res = await fetch(`/productCategory/unit/get/${productCategoryID}`)
                return await res.json()
            }
            const unit = await getProductCategoryUnit($('#productCategory').find('option:selected').val())

            productCategoryLabel.text(unit.smallTitle)




            $('#productCategory').on('change', async function (e) {
                const selectedProductCategoryID = $(this).find('option:selected').val()
                const unit = await getProductCategoryUnit(selectedProductCategoryID)

                productCategoryLabel.text(unit.smallTitle)
            })

        })







    }



    return {
        // Public functions
        init: function () {
            // Elements
            modal = new bootstrap.Modal(document.querySelector('#kt_modal_edit_product'));

            form = document.querySelector('#kt_modal_edit_product_form');
            submitButton = form.querySelector('#kt_modal_edit_product_submit');
            cancelButton = form.querySelector('#kt_modal_edit_product_cancel');
            closeButton = form.querySelector('#kt_modal_edit_product_close');



            handleForm();
        }
    };
}();


const linkEventsTriggers = ()=>{
    $('.edit').on('click', async function (e) {
        e.preventDefault()
        const id = e.target.id
        const res = await fetch(`/product/get?_id=${id}`)
        const {product} = await res.json()
        $('#editPrductTitle').val(product.name)
        $('#editProductCategory').val(product.productCategory).change();
        $('#editProductSerialNumber').val(product.serialNumber)
        $('#kt_modal_edit_product').modal('show');

    })

}



// On document ready
KTUtil.onDOMContentLoaded(function () {

    KTModalProductCategoryEdit.init();
});

