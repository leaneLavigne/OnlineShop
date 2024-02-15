$(document).ready(function(){
    const urlParams = new URLSearchParams(window.location.search);
    const orderNumber = urlParams.get('orderNumber')
    const order = JSON.parse(localStorage.getItem(`order_${orderNumber}`));
    if (order) {
      $("#confirmation-number").text(`Commande #${order.orderNumber}`);
      $("#name").text(order.customer);
    }
  });