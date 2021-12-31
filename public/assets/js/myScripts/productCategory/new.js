"use strict";
// Class definition
var KTModalProductCategoryAdd = function () {
    var submitButton;
    var cancelButton;
    var closeButton;
    var validator;
    var form;
    var modal;

    let isWeightUnit = false
    let internalProductCategorySerialNumber = false
    let internalProductSerialNumber = false
    let addProduct = false


    // Init form inputs
    var handleForm = function () {
        // Init form validation rules. For more info check the FormValidation plugin's official documentation:https://formvalidation.io/
        const checkIfProductCategorySerialNumberRequired = function () {
            return {
                validate: function (input) {
                    const value = input.value;

                    if (internalProductCategorySerialNumber) {
                        return {
                            valid: true,
                        };
                    } else if (value.length > 0){
                        return {
                            valid: true,
                        };
                    }else{
                        return {
                            valid: false,
                        };
                    }

                },
            };
        };

        const checkIfProductSerialNumberRequired = function () {
            return {
                validate: function (input) {
                    const value = input.value;
                    console.log(addProduct);
                    if(!addProduct){
                        return {
                            valid: true,
                        };
                    }else if (internalProductSerialNumber) {
                        return {
                            valid: true,
                        };
                    } else if (value.length > 0){
                        return {
                            valid: true,
                        };
                    }else{
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
                    if(!addProduct){
                        return {
                            valid: true,
                        };
                    }else if (isWeightUnit) {
                        return {
                            valid: true,
                        };
                    } else if (value.length > 0){
                        return {
                            valid: true,
                        };
                    }else{
                        return {
                            valid: false,
                        };
                    }     
                },
            };
        };


        FormValidation.validators.checkIfProductCategorySerialNumberRequired = checkIfProductCategorySerialNumberRequired;
        FormValidation.validators.checkIfProductSerialNumberRequired = checkIfProductSerialNumberRequired;
        FormValidation.validators.checkIfProductSellingPriceRequired = checkIfProductSellingPriceRequired;


        validator = FormValidation.formValidation(
            form,
            {
                fields: {
                    'name': {
                        validators: {
                            notEmpty: {
                                message: 'اسم الصنف مطلوب'
                            }
                        }
                    },
                    'productCategory': {
                        validators: {
                            notEmpty: {
                                message: 'وحدة الصنف مطلوبة.'
                            }

                        }
                    },
                    'qty': {
                        validators: {
                            notEmpty: {
                                message: 'الكمية مطلوبة.'
                            }

                        }
                    },
                    'productCategorySerialNumber': {
                        validators: {
                            checkIfProductCategorySerialNumberRequired: {
                                message: 'السيريال نمبر للصنف مطلوب.'
                            }

                        }
                    }
                    ,
                    'productCategorySellingPrice': {
                        validators: {
                            notEmpty: {
                                message: 'سعر البيع للصنف مطلوب.'
                            }

                        }
                    },
                    
                    'costPrice': {
                        validators: {
                            notEmpty: {
                                message: 'سعر التكلفة للصنف مطلوب.'
                            }

                        }
                    },
                    'supplier': {
                        validators: {
                            notEmpty: {
                                message: 'مورد الصنف مطلوب'
                            }

                        }
                    },
                    'productSerialNumber': {
                        validators: {
                            checkIfProductSerialNumberRequired: {
                                message: 'السيريال نمبر للمنتج مطلوب.'
                            }
                        }
                    },
                    'productSellingPrice': {
                      
                        validators: {
                            checkIfProductSellingPriceRequired: {
                                message: 'سعر بيع المنتج للوحدة الواحدة مطلوب'

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
                            name: $("input[name=name]").val(),
                            unit: $("select[name=unit]").val(),
                            qty: $("input[name=qty]").val(),
                            productCategorySerialNumber: $("input[name=productCategorySerialNumber]").val(),
                            productCategoryCostPrice:$("input[name=costPrice]").val(),
                            productCategorySellingPrice: $("input[name=productCategorySellingPrice]").val(),
                            supplier: $("select[name=supplier]").val(),

                            productSerialNumber: $("input[name=productSerialNumber]").val(),
                            productSellingPrice: $("input[name=productSellingPrice]").val(),

                            configs:{
                                addProduct,
                                internalProductSerialNumber,
                                internalProductCategorySerialNumber,
                                isWeightUnit
                            }

                        }

                        $.post('/productCategory/new', {payload:JSON.stringify(payload)}).then(recipientID => {
                            submitButton.removeAttribute('data-kt-indicator');

                            Swal.fire({
                                text: "تم إضافة الصنف بنجاح!",
                                icon: "success",
                                buttonsStyling: false,
                                confirmButtonText: "حسنا",
                                customClass: {
                                    confirmButton: "btn btn-primary"
                                }
                            }).then(function (result) {
                                if (result.isConfirmed) {
                                    // Hide modal
                                    modal.hide();

                                    // Enable submit button after loading
                                    submitButton.disabled = false;
                                    window.location = '/productCategories/page/get'

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
                    modal.hide(); // Hide modal	
                    window.location = `/productCategories/page/get`
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

        closeButton.addEventListener('click', function (e) {
            e.preventDefault();

            Swal.fire({
                text: "هل أنت متأكد من إلغاء العملية ؟",
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
                    modal.hide(); // Hide modal	
                    window.location = `/productCategories/page/get`


                } else if (result.dismiss === 'cancel') {
                    Swal.fire({
                        text: "لم يتم إلغاء العملية!",
                        icon: "error",
                        buttonsStyling: false,
                        confirmButtonText: "حسنا",
                        customClass: {
                            confirmButton: "btn btn-primary",
                        }
                    });
                }
            });
        })

        $('#unit').on('change', function (e) {
            const selectedUnit = $(this).find('option:selected').attr('unit')
            if (selectedUnit == 'weight') {
                $('#productSellingPriceBlock').addClass('d-none')
                isWeightUnit = true
            } else {
                $('#productSellingPriceBlock').removeClass('d-none')
                isWeightUnit = false
            }
        })

        $('#productCategorySerialNumberBtn').on('change', function (e) {
            if (this.checked) {
                $('#productCategorySerialNumberBlock').addClass('d-none')
                internalProductCategorySerialNumber = true
            } else {
                $('#productCategorySerialNumberBlock').removeClass('d-none')
                internalProductCategorySerialNumber = false
            }
        })
        $('#addProduct').on('change', function (e) {
            if (this.checked) {
                $('#productBlock').removeClass('d-none')
                addProduct = true
            } else {
                $('#productBlock').addClass('d-none')
                addProduct = false
            }
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





    }

    return {
        // Public functions
        init: function () {
            // Elements
            modal = new bootstrap.Modal(document.querySelector('#kt_modal_add_productCategory'));

            form = document.querySelector('#kt_modal_add_productCategory_form');
            submitButton = form.querySelector('#kt_modal_add_productCategory_submit');
            cancelButton = form.querySelector('#kt_modal_add_productCategory_cancel');
            closeButton = form.querySelector('#kt_modal_add_productCategory_close');



            handleForm();
        }
    };
}();





// On document ready
KTUtil.onDOMContentLoaded(function () {

    KTModalProductCategoryAdd.init();
});

