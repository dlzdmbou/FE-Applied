// DOM ready
$(document).ready(function () {
    console.error('jquery is fun, right? ...SAY IT!!! (with your inner voice or you will bring shame to your family)');

    // Cookies
    $(".cookie-buttons").click(function () {
        console.log('TODO: cookie clicker');
        $("#cookie-notice").slideUp(1000);
    });

    // Form inputs (> parent() legend)
    $(".form-input").on("focus, click", function () {
        if (!$(this).parent().hasClass("active")) {
            $(this).parent().addClass("active");
        }
    });
    $(".form-input").on("blur", function () {
        if ($(this).parent().hasClass("active")) {
            $(this).parent().removeClass("active");
        }
    });

    $(".password-reveal").on("click", function () {
        const inputElement = $(this).next();
        if (inputElement.attr("type") === "password") {
            inputElement.attr("type", "text");
            $(this).addClass("active");
        } else {
            inputElement.attr("type", "password");
            $(this).removeClass("active");
        }
    });
    $(".search-clear").on("click", function() {
        $("#product-search").val("");
        searchTable("", $("#product-table"));
    });

    // form validation login form. 
    // check for errors for fieldsets style.
    $("#form-login").validate({
        invalidHandler: function (event, validator) {
            let errors = validator.numberOfInvalids();
            if (errors) {
                console.log(event);
                console.log("Errors: " + errors);
            }
        },
        highlight: function (element, errorClass, validClass) {
            $(element).addClass(errorClass).removeClass(validClass);
            $(element.form).find("label[for=" + element.id + "]").addClass(errorClass);
            $(element).parent().addClass("error");
            $("#form-btn-login").attr("disabled", true);
        },
        unhighlight: function (element, errorClass, validClass) {
            $(element).removeClass(errorClass).addClass(validClass);
            $(element.form).find("label[for=" + element.id + "]").removeClass(errorClass);
            $(element).parent().removeClass("error");
            $("#form-btn-login").attr("disabled", false);
        },
        submitHandler: function (form) {
            // do other things for a valid form
            form.submit();
        }
    });

    // member reviews slider
    slider($(".membershitBanner"));

    // Fetch blog items
    initBlog();

    // Fetch table data.
    initTable();

    initWizards();
});

function slider(element) {
    const _this = element;
    const slides = $(element).find("div.slider-container").children();
    const controls = $(element).find("div.controls").children();

    // initial slide, 0 default.
    $(slides).each(function (index, element) {
        if (index > 0) {
            $(element).hide();
        }
    });

    // bind slider controls
    $(controls).each(function (index, element) {
        $(element).on("click", function () {
            sliderSlide(_this, $(element).attr("data-attr-action"));
        });
    });

}

function sliderSlide(slider, action) {
    const slides = $(slider).find("div.slider-container").children();

    $(slides).each(function (index, element) {
        if ($(element).is(":visible")) {
            switch (action) {
                case "prev":
                    if (index > 0) {
                        $(element).prev().fadeIn();
                    } else {
                        $(element).siblings().last().fadeIn("slow");
                    }
                    $(element).fadeOut();
                    break;
                case "next":
                    if (index < slides.length - 1) {
                        $(element).next().fadeIn();
                    } else {
                        $(element).siblings().first().fadeIn("slow");
                    }
                    $(element).fadeOut();
                    break;
                default:
                    console.log(action);
            }
            return false;
        }
    });

}

function initWizards() {
    $.get("./server-responses/wizards.json", function (data) {
        $.get("WizardItem.html", function (template) {
            
            const productList = [];

            $(data).each(function (index, product) {
                const html = $(template).clone();
                $(html).find("img").prop("src", product.image_path);
                $(html).prop('id', "product-code-" + product.id);
                $(html).find("span span").html(product.id);
                productList.push(html);
            });

            $("#wizard-items").html(productList);
        });
    });
}

function initBlog() {
    $.get("./server-responses/top-products.json", function (data) {
        $.get("BlogItem.html", function (template) {

            const productList = [];

            $(data.products).each(function (index, product) {
                const html = $(template).clone();
                $(html).find("a").prop('href', "products.html?productID=" + product.id);
                $(html).find("span h5").html(product.name);
                $(html).find("span span").html(product.price + "$");
                $(html).find("p").html(product.short_description);
                $(html).find("img").prop("src", product.image_path);
                $(html).find("img").prop("alt", product.name);
                $(html).prop('id', "product-code-" + product.id);
                productList.push(html);
            });

            $("#blog-items").html(productList);
        });
    });
}

function initTable() {
    updateCart();

    $.get("./server-responses/products.json", function (data) {
        const thead =
            `<thead>
                <tr>
                    <th data-sorter="false">&nbsp;<!--img col--></th>
                    <th>Model</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th data-sorter="false">&nbsp;<!--ctrls col--></th>
                </tr>
            </thead>`;
        const tbody = `<tbody></tbody>`;

        $("#product-table").append(thead);
        $("#product-table").append(tbody);

        $(data.products).each(function (index, product) {
            let isActive = product.id == $.urlParam('productID') ? 'highlight' : '';
            const tr =
                `<tr id="product-table-tr-${product.id}" class="${isActive}">
                <td><img src="${product.image_path}" alt="${product.name}" class="product-img"/></td>
                <td>${product.name}</td>
                <td width="50%">${product.short_description}</td>
                <td>${product.price}</td>
                <td>
                    <button class="cart-add" 
                        data-attr-product-id="${product.id}" 
                        data-attr-product-name="${product.name}" 
                        data-attr-product-price="${product.price}">
                            +
                    </button>
                </td>
            </tr>`;

            $("#product-table tbody").append(tr);

            if (isActive) {

                $([document.documentElement, document.body]).animate({
                    scrollTop: $("#product-table-tr-" + product.id).offset().top - 250
                }, 1000);

                setTimeout(function () {
                    $("#product-table-tr-" + product.id).removeClass('highlight');
                }, 5000);
            }
        });

        $("#product-table").tablesorter();

        $("#product-search").on("input", function (event) {
            searchTable($(this).val().toLowerCase(), $("#product-table"));
        });

        $('.cart-add').on("click", function (event) {
            let html = `<li data-attr-product-id="${$(this).attr("data-attr-product-id")}" 
                            data-attr-product-price="${$(this).attr("data-attr-product-price")}">
                            <span>${$(this).attr("data-attr-product-name")}<br/>${$(this).attr("data-attr-product-price")}</span>
                            <span><button class="product-remove">x</button></span>
                        </li>`
            $("#shopping-cart").append(html);
            $(this).parent().parent().addClass('disabled');

            $('.product-remove').on("click", function () {
                $("#product-table-tr-" + $(this).parent().parent().attr("data-attr-product-id")).removeClass('disabled');
                $(this).parent().parent().remove();
                updateCart();
            });
            updateCart();
        });

        $('#shopping-cart-clear').on("click", function () {
            $("#shopping-cart li").each(function (index, element) {
                $("#product-table-tr-" + $(this).attr("data-attr-product-id")).removeClass('disabled');
                $(this).remove();
            });
            updateCart();
        });

        updateCart();

    });
}

function updateCart() {
    let total = 0;
    $("#shopping-cart li").each(function (index, element) {
        if ($(this).attr("data-attr-product-price")) {
            total += parseFloat($(this).attr("data-attr-product-price"))
        }
    });
    if (total === 0) {
        $('#shopping-cart-wrapper').slideUp("fast");
    } else {
        $('#shopping-cart-wrapper').slideDown("slow");
    }

    $("#shopping-cart-total").html("<span>Total:</span> <span>" + total.toFixed(2) + " $</span>");
}

function searchTable(searchString, table) {
    table.find('tbody tr').each(function () {
        let row = $(this);

        if (searchString === "") {
            row.removeClass('hidden highlight');
            $(".search-clear").hide();
            return;
        }

        let matchFound = false;
        $(".search-clear").show();

        row.find('td').each(function () {
            let cell = $(this);
            if (cell.text().toLowerCase().indexOf(searchString) !== -1) {
                matchFound = true;
                return false; // Break out of the each loop if a match is found
            }
        });

        if (matchFound) {
            // Remove the hidden class if there's a match
            row.removeClass('hidden');
            row.addClass('highlight');
        } else {
            // Add the hidden class if there's no match
            row.addClass('hidden');
            row.removeClass('highlight');
        }
    });
}


$.urlParam = function (name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results == null) {
        return null;
    }
    return decodeURI(results[1]) || 0;
}