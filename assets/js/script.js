$(document).ready(function () {

  //3.4 SHOPPING-CART 

  function updateCartDisplay() {
    const cart = getCart();

    if (cart.length === 0) {
      $("#cart-section").hide();
      $("#cart-text").show();
      $("#total-amount").text("");
    } else {
      $("#cart-section").show();
      $("#cart-text").hide();
      cart.sort((a, b) => a.product.name.localeCompare(b.product.name));

      updateTable(cart);
      updateTotalAmount(cart);
    }
  }


  function updateTable(cart) {
    const cartBody = $("#cart-body");
    cartBody.empty();

    cart.forEach((entry) => {
      const product = entry.product;
      const quantity = entry.quantity;
      const totalPrice = (product.price * quantity).toFixed(2);

      const rowHtml = `
      <tr>
        <td>
          <button class="remove-item-button" data-product-id="${product.id}"><i class="fa fa-times"></i></button>
        </td>
        <td><a href="./product.html?id=${product.id}">${product.name}</a></td>
        <td class="price">${product.price.toFixed(2)} $</td>
        <td class="quantity">
          <button class="remove-quantity-button" ${quantity === 1 ? 'disabled' : ''} data-product-id="${product.id}"><i class="fa fa-minus"></i></button>
          ${quantity}
          <button class="add-quantity-button" data-product-id="${product.id}"><i class="fa fa-plus"></i></button>
        </td>
        <td class="total-price">${totalPrice} $</td>
      </tr>`;


      cartBody.append(rowHtml);
    });


    $(".remove-item-button").on("click", function () {
      const productId = $(this).data("product-id");
      removeItemFromCart(productId);
    });
  }


  function updateTotalAmount(cart) {
    const totalAmount = cart.reduce((total, entry) => total + entry.product.price * entry.quantity, 0).toFixed(2);
    $("#total-amount").html(`Total: <strong>${totalAmount} $</strong>`);
  }


  function removeItemFromCart(productId) {
    const cart = getCart();

    const indexToRemove = cart.findIndex((entry) => entry.product.id === productId);

    if (indexToRemove !== -1) {
      const removedEntry = cart.splice(indexToRemove, 1)[0];
      updateCartDisplay();


      const confirmMessage = `Voulez-vous supprimer le produit "${removedEntry.product.name}" du panier ?`;
      if (confirm(confirmMessage)) {
        updateCartBadge();
        updateTable(cart);
        updateTotalAmount(cart);


        updateLocalStorage(cart);
      }
    }
    updateCartDisplay();
    updateCartBadge();
  }


  function updateLocalStorage(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }


  function clearCart() {
    localStorage.removeItem("cart");
    updateCartDisplay();
    updateCartBadge();
  }


  $("#remove-all-items-button").on("click", function () {
    const confirmMessage = "Voulez-vous supprimer tous les produits du panier ?";
    if (confirm(confirmMessage)) {
      clearCart();
    }
  });



  function updateCartBadge() {
    const cart = getCart();
    const numItems = cart.reduce((total, entry) => total + entry.quantity, 0);
    var badge = $(".shopping-cart > .count");

    if (numItems === 0) {
      badge.hide();
    } else {
      badge.text(numItems).show();
    }
  }



  function decreaseQuantity(productId) {
    const cart = getCart();
    const entry = cart.find((entry) => entry.product.id === productId);

    if (entry && entry.quantity > 1) {
      entry.quantity--;
      updateLocalStorage(cart);
      updateCartDisplay();
      updateCartBadge();
    }
  }


  function increaseQuantity(productId) {
    const cart = getCart();
    const entry = cart.find((entry) => entry.product.id === productId);

    if (entry) {
      entry.quantity++;


      updateLocalStorage(cart);
      updateCartDisplay();
      updateCartBadge();
    }
  }


  $("#cart-body").on("click", ".remove-quantity-button", function () {
    const productId = $(this).data("product-id");
    decreaseQuantity(productId);
  });

  $("#cart-body").on("click", ".add-quantity-button", function () {
    const productId = $(this).data("product-id");
    increaseQuantity(productId);
  });

  $("#product").on("click", ".remove-quantity-button", function () {
    const productId = $(this).data("product-id");
    decreaseQuantity(productId);
  });

  $("#product").on("click", ".add-quantity-button", function () {
    const productId = $(this).data("product-id");
    increaseQuantity(productId);
  });





  //3.2 PRODUCTS.HTML
  function retrieveJson() {
    $.ajax({
      url: './assets/json/products.json',
      type: 'GET',
      dataType: 'json',
      success: function (products) {
        displayProducts(products);
      },
      error: function (error) {
        console.error('Error loading products:', error);
      }
    });
  }


  function displayProducts(products) {
    products.sort(function (a, b) {
      return a.price - b.price;
    });

    var productsList = $("#products-list");
    productsList.empty();

    products.forEach(function (product) {
      var productHtml = `
        <div class="product" data-category="${product.category}">
          <a href="./product.html?id=${product.id}">
            <h2>${product.name}</h2>
            <img alt="${product.name}" src="./assets/img/${product.image}" >
            <p class="price"><small>Prix</small> ${product.price.toFixed(2).replace('.', ',')} $</p>
          </a>
        </div>`;
      productsList.append(productHtml);
    });

    $(".btn-group#product-categories button").on("click", function () {
      var category = $(this).text();
      categorySelected(category);
    });

    // Add event handler for criteria selection
    $(".btn-group#product-criteria button").on("click", function () {
      var criteria = $(this).text();
      criteriaSelected(criteria);
    });

    updateCount(products.length);
  }


  function updateCount(count) {
    $("#products-count").text(`${count} produit${count !== 1 ? 's' : ''}`);
  }


  function criteriaSelected(criteria) {
    $(".btn-group#product-criteria button").removeClass("selected");
    $(`.btn-group#product-criteria button:contains('${criteria}')`).addClass("selected");


    var products = $("#products-list .product");
    if (criteria === "Prix (bas-haut)") {
      products.sort(function (a, b) {
        return parseFloat($(a).find(".price").text().match(/[\d,]+(\.\d+)?/)[0].replace(',', '.')) - parseFloat($(b).find(".price").text().match(/[\d,]+(\.\d+)?/)[0].replace(',', '.'));
      });
    } else if (criteria === "Prix (haut-bas)") {
      products.sort(function (a, b) {
        return parseFloat($(b).find(".price").text().match(/[\d,]+(\.\d+)?/)[0].replace(',', '.')) - parseFloat($(a).find(".price").text().match(/[\d,]+(\.\d+)?/)[0].replace(',', '.'));
      });
    } else if (criteria === "Nom (A-Z)") {
      products.sort(function (a, b) {
        return $(a).find("h2").text().localeCompare($(b).find("h2").text());
      });
    } else if (criteria === "Nom (Z-A)") {
      products.sort(function (a, b) {
        return $(b).find("h2").text().localeCompare($(a).find("h2").text());
      });
    }

    $("#products-list").empty().append(products);
  }

  function categorySelected(category) {

    $(".btn-group#product-categories button").removeClass("selected");
    $(`.btn-group#product-categories button:contains('${category}')`).addClass("selected");

    $("#products-list .product").hide();
    if (category === "Tous les produits") {
      $("#products-list .product").show();
    } else {
      $("#products-list .product").filter(function () {
        return $(this).data('category') === category.toLowerCase();
      }).show();
    }
    var displayedProductsCount = $("#products-list .product:visible").length;
    updateCount(displayedProductsCount);
  }

  $(".btn-group#product-categories button").on("click", function () {
    var category = $(this).text();
    categorySelected(category);
  });
  $(".btn-group#product-criteria button").on("click", function () {
    var criteria = $(this).text();
    criteriaSelected(criteria);
  });


  retrieveJson();

  // 3.3 Product page
  if (window.location.pathname.endsWith('/product.html')) {
    let product;

    $('#product').hide();

    const urlSearchMatch = window.location.search.match(/id=(\d+)/);
    if (urlSearchMatch != null) {
      const productId = urlSearchMatch[1];
      fetchProducts().then((products) => {
        product = products.find((product) => product.id == productId);
        displayProduct(product);
      }).catch(() => displayError());
    }
    else {
      displayError();
    }


    $('#add-to-cart-form').submit((event) => {
      event.preventDefault();
      const formData = new FormData(event.target);

      if (product) {
        addProduct(product, parseInt(formData.get('quantity')));
      } else {
        console.error("Product not found. Unable to add to cart.");
      }
    });

    function displayProduct(product) {
      const productEl = $('#product');
      productEl.show();
      productEl.find('#product-name').text(product.name);
      productEl.find('#product-image')
        .attr('src', `./assets/img/${product.image}`)
        .attr('alt', product.name);
      productEl.find('#product-desc p').html(product.description);
      productEl.find('#product-price').html(product.price);
      const featuresContainer = productEl.find('#product-features ul');
      $.each(product.features, (_, feature) => featuresContainer.append(`<li>${feature}</li>`));
    }

    function addProduct(product, quantity) {
      const dialog = $('#dialog');
      dialog.show()
        .animate({ opacity: 1 }, 300)
        .delay(5000)
        .animate({ opacity: 0 }, 300, () => dialog.hide());

      addToCart(product, quantity);
      updateCartBadge();
      updateCartDisplay();
    }

    function displayError() {
      $('main').append('<h2>Page non trouvée!</h1>');
    }

  }


  // Shared functions

  function fetchProducts() {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: 'assets/json/products.json',
        type: 'GET',
        // dataType: 'json',
        success: function(products) {
          resolve(products);
        },
        error: function(error) {
          reject(error);
        }
      });
    });
  }

  const CART_STORAGE_KEY = 'cart';

  /**
   * Retrieves the stored state of the cart.
   * @returns An array of objects that contain a product (the data of a product 
   * from products.json) and a quantity.
   * I.e. [{product: {id: 1, name: "item name", etc.}, quantity: 3}, ...]
   */
  function getCart() {
    const cartJson = localStorage.getItem(CART_STORAGE_KEY);

    if (cartJson !== null) {
      return JSON.parse(cartJson);
    }
    else {
      return [];
    }
  }

  /**
   * Add a new product to the cart or add to the quantity of a product already in the cart.
   * @param {*} product - An object containing all of the product's data.
   * @param {*} quantity - The quantity of that product.
   */
  function addToCart(product, quantity) {
    const cart = getCart();
    var cartSize = parseInt(localStorage.getItem("cartSize"));

    const existingProduct = cart.find((entry) => entry.product.id === product.id);

    if (existingProduct === undefined) {
      // product not already in cart
      cart.push({ product, quantity });
    }
    else {
      // product already in cart
      existingProduct.quantity += quantity;
    }

    if (!cartSize || cartSize === null) {
      cartSize = quantity
    } else {
      cartSize += quantity
    }

    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    localStorage.setItem("cartSize", JSON.stringify(cartSize));
  }


  updateCartBadge();

  /* 3.5 */
  if (window.location.pathname.endsWith('/order.html')) {
    $("#order-form").validate({
      rules: {
        "first-name": {
          required: true,
          minlength: 2
        },
        "last-name": {
          required: true,
          minlength: 2
        },
        email: {
          required: true,
          email: true
        },
        phone: {
          required: true,
          phoneUS: true
        },
        "credit-card": {
          required: true,
          creditcard: true
        },
        "credit-card-expiry": {
          required: true,
          creditCardExpiry: true
        }
      },
      messages: $.validator.messages
    });
    $.validator.addMethod("creditCardExpiry", function (value, element) {
      return this.optional(element) || /^(?:0[1-9]|1[0-2])\/\d{2}$/.test(value);
    }, "La date d'expiration de votre carte de crédit est invalide.");

    $("#order-form").submit(function (event) {
      event.preventDefault();
      if ($(this).valid()) {
        const firstName = $("#first-name").val();
        const lastName = $("#last-name").val();
        const orderNumber = getOrderNumber();
        const order = { orderNumber, customer: `${firstName} ${lastName}` };
        localStorage.setItem('order', JSON.stringify(order));
        clearCart();
        window.location.href = 'confirmation.html';
      }
    });

    function getOrderNumber() {
      const currNumber = parseInt(localStorage.getItem("lastOrderNumber") || "0");
      const nextNumber = currNumber + 1;
      localStorage.setItem("lastOrderNumber", nextNumber.toString());
      return nextNumber;
    }
  }

  // 3.6
  if (window.location.pathname.endsWith('/confirmation.html')) {
    const orderJson = localStorage.getItem('order');
    if (orderJson != null) {
      const order = JSON.parse(orderJson);
      $('#name').text(order.customer);
      $('#confirmation-number').text(order.orderNumber);
    }
  }

  updateCartDisplay();

});