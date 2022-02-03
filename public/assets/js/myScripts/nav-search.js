"use strict";

// Class definition
// Private variables
var element;
var formElement;
var mainElement;
var resultsElement;
var wrapperElement;
var emptyElement;

var preferencesElement;
var preferencesShowElement;
var preferencesDismissElement;

var advancedOptionsFormElement;
var advancedOptionsFormShowElement;
var advancedOptionsFormCancelElement;
var advancedOptionsFormSearchElement;

var searchObject;

// Private functions
var processs = function (search) {

    $.get(`/utils/search/${search.getQuery()}`, data => {

        let partial = data.map(obj => {
            /*
            return `<!--begin::Item-->
        <a href="/${obj.type}/profile/get/${obj._id}"
        class="d-flex text-dark text-hover-primary align-items-center mb-5">
        <!--begin::Symbol-->
        <div class="symbol symbol-40px me-4">
            <img src="/assets/media/avatars/150-2.jpg" alt="" />
        </div>
        <!--end::Symbol-->
        <!--begin::Title-->
        <div
            class="d-flex flex-column justify-content-start fw-bold">
            <span class="fs-6 fw-bold">${obj.name} </span> 
            <span class="fs-7 fw-bold text-muted">${obj.formalID}</span>
        </div>
        <!--end::Title-->
       </a>
       <!--end::Item-->`
*/
                return `<a class="text-black" href="/${obj.type}/profile/get/${obj._id}">
                <div class="menu-item ">
       <div class="menu-content d-flex align-items-center">
           <!--begin::Avatar-->
           <div class="symbol symbol-50px me-5">
               <img alt="Logo" src="/assets/media/avatars/150-26.jpg">
           </div>
           <!--end::Avatar-->
           <!--begin::Username-->
           <div class="d-flex flex-column">
               <div class="fw-bolder d-flex align-items-center fs-5">${obj.name} ${(obj.type == 'customer') ? '<span class="badge badge-light-success fw-bolder fs-8 px-2 py-1 ms-2">زبون</span>' : '<span class="badge badge-light-warning fw-bolder fs-8 px-2 py-1 ms-2">مورد</span>'}
               </div>
               <a href="#" class="fw-bold text-muted text-hover-primary fs-7">${obj.formalID}</a>
               
           </div>
           <!--end::Username-->
       </div>
   </div>
                </a>`
        }).join(' ')



        mainElement.classList.add('d-none');
        if (data.length == 0) {
            // Hide results
            resultsElement.classList.add('d-none');
            // Show empty message 
            emptyElement.classList.remove('d-none');
        } else {
            $('.content-search').html(partial)

            // Show results
            resultsElement.classList.remove('d-none');
            // Hide empty message 
            emptyElement.classList.add('d-none');

        }
        search.complete();

    })
}

var clear = function (search) {
    // Show recently viewed
    mainElement.classList.remove('d-none');
    // Hide results
    resultsElement.classList.add('d-none');
    // Hide empty message 
    emptyElement.classList.add('d-none');
}



var handleAdvancedOptionsForm = function () {
    // Show
    advancedOptionsFormShowElement.addEventListener('click', function () {
        wrapperElement.classList.add('d-none');
        advancedOptionsFormElement.classList.remove('d-none');
    });

    // Cancel
    advancedOptionsFormCancelElement.addEventListener('click', function () {
        wrapperElement.classList.remove('d-none');
        advancedOptionsFormElement.classList.add('d-none');
    });

    // Search
    advancedOptionsFormSearchElement.addEventListener('click', function () {

    });
}

// Public methods

// Elements
element = document.querySelector('#kt_header_search');


wrapperElement = element.querySelector('[data-kt-search-element="wrapper"]');
formElement = element.querySelector('[data-kt-search-element="form"]');
mainElement = element.querySelector('[data-kt-search-element="main"]');
resultsElement = element.querySelector('[data-kt-search-element="results"]');
emptyElement = element.querySelector('[data-kt-search-element="empty"]');

preferencesElement = element.querySelector('[data-kt-search-element="preferences"]');
preferencesShowElement = element.querySelector('[data-kt-search-element="preferences-show"]');
preferencesDismissElement = element.querySelector('[data-kt-search-element="preferences-dismiss"]');

advancedOptionsFormElement = element.querySelector('[data-kt-search-element="advanced-options-form"]');
advancedOptionsFormShowElement = element.querySelector('[data-kt-search-element="advanced-options-form-show"]');
advancedOptionsFormCancelElement = element.querySelector('[data-kt-search-element="advanced-options-form-cancel"]');
advancedOptionsFormSearchElement = element.querySelector('[data-kt-search-element="advanced-options-form-search"]');

// Initialize search handler
searchObject = new KTSearch(element);

// Search handler
searchObject.on('kt.search.process', processs);

// Clear handler
searchObject.on('kt.search.clear', clear);

