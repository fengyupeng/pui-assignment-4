var cartList = [];
var nameList = ["Couch Pillow", "Bed Pillow", "Round Pillow", "Floor Pouf Pillow"];
var priceList = [25, 28, 15, 25];
var idList = ["couch", "bed", "round", "floor"];

// where all your product goes
//localStorage.removeItem("savedCart");

$(document).ready(function(){
    // figure out which page im on
    var page_name = $("body").attr("id");
    var detailIndex = JSON.parse(localStorage.getItem("savedDetailIndex"));

    // load cart from local storage
    // used accross all pages
    cartList = JSON.parse(localStorage.getItem("savedCart"));
    if (cartList == null) {
        cartList = [];
    } else {
        //update number on cart
        $("#cart").text(function(){
            return "Cart ("+get_total_quantity()+")";
        });
    }

    if (page_name == "home_page") {
    // ganerates the products on page for home page
        for (i=1; i<4; i++){
            $new_product = $('.product:last').clone();
            $new_product.insertAfter('.product:last');
            update_block($new_product,i);
        }
    }

    // when on detail page
    if (page_name == "detail_page") {
        update_block($('.product'), detailIndex);
        $('body').find('h2').text(function(){
            return "About Our "+nameList[detailIndex];
        });
        $('.detail_img').attr("src", "../resources/images/detail_img"+detailIndex+".png");
    }

    // in cart page
    if (page_name == "cart_page") {
        if (get_total_quantity() == 0) {
            $('.item').remove();
            alert("Your car is empty! Go to Home page to add more product!")
        } else {
            // update the first item
            $item = $('.item');
            update_item($item, 0);
            // generate items in cart, when cart is not empty
            for (i = 1; i < cartList.length; i++) {
                $new_item = $('.item:last').clone();
                update_item($new_item, i);
                $new_item.insertAfter('.item:last');
            }
        }
        // update quantity and total price
        var total_p = get_total_price();
        var total_q = get_total_quantity();
        $('.total_quantity').text(function(){
            return "Total ("+total_q+" items): $"+total_p;
        })
        $checkout_block = $('.checkout').clone();
        $checkout_block.insertAfter('.cart');
    }


    // click events
    // add to cart button clocked
    $("button.add_button").click(function(){
        var product_name = $(this).attr('name');
        var index = get_index(product_name);
        var product_price = priceList[index];
        $product = $(this).parent().parent();
        var product_quantity = parseInt(($product).find("input.quantity_input").attr("value"));
        var product_shape = $('#' + product_name).find("input[name='shape']:checked").val();
        add_product_to_cart(product_name, product_price,product_shape, product_quantity);
        // change number in header
        $("#cart").text(function(){
            return "Cart ("+get_total_quantity()+")";
        });
        // save cart to local storage
        localStorage.setItem("savedCart", JSON.stringify(cartList));
    });

    // delete button in cart
    $("button.delete_button").click(function(){
        var item_id = $(this).attr('name');
        var index = item_id[item_id.length -1];
        cartList.splice(index, 1);
        localStorage.setItem("savedCart", JSON.stringify(cartList));
        location.reload();
    });

    // change quantity
    $(".minus_button").click(function(){
        var quantity = parseInt($(this).next().attr('value'));
        quantity = (quantity>0) ? quantity-1 :0;
        $(this).next().attr('value',quantity);
    });
    $(".plus_button").click(function(){
        var quantity = parseInt($(this).prev().attr('value'));
        quantity = quantity + 1;
        $(this).prev().attr('value',quantity);
    });

    $(".detail_link").click(function() {
        $product = $(this).parent().parent();
        var index = parseInt(get_index(($product).attr("id")));
        localStorage.setItem("savedDetailIndex", JSON.stringify(index));

    });

});

// update the cloned block
function update_block(block, i) {
    var page_name = $("body").attr("id");
    var img_src = '';
    if (page_name == "home_page") {
        img_src = "resources/images/pillow"+i+".png";
    } else {
        img_src = "../resources/images/pillow"+i+".png"
    }
    $(block).find('img').attr('src',img_src);
    $(block).find('h1.product_name').html(nameList[i]+"<br />$"+priceList[i]);
    $(block).attr('id', idList[i]);
    // the add to cart button
    $(block).find('button').attr('name', idList[i]);
}

// update item
function update_item(item, i) {
    var product = cartList[i];
    var product_name = product.product_name;
    var index = get_index(product_name);
    $(item).attr('id', 'item_'+i);
    $(item).find('button.delete_button').attr('name', 'item_'+i);
    $(item).find('h1.item_name').text(function(){
        return nameList[index];
    });
    var img_src = "../resources/images/pillow"+index+".png";
    $(item).find('img').attr('src',img_src);
    var q = product.product_quantity;
    var p = product.product_price;
    var s = product.product_shape;
    $(item).find('p.selection_shape').text(function(){
            return "Shape: "+s;
        });
    $(item).find('input.item_quantity_input').attr('value', q)
    $(item).find('h1.item_price').text(function(){
            return '$'+p*q;
        });

}

// get index of the product
function get_index(product_name) {
    for (j = 0; j<4; j++) {
        if (idList[j] == product_name) {
            return j;
        }
    }
}

function add_product_to_cart(n, p, s, q) {
    if (q == 0) {
        return;
    }
    var i = get_index(n);
    var inCart = false;
    for (i = 0; i < cartList.length; i++){
        var name = cartList[i].product_name;
        var shape = cartList[i].product_shape;
        if ((n == name)&& (s == shape)){
            cartList[i].product_quantity += q;
            inCart = true;
        }
    }

    if (inCart == false) {
        var new_product = new Product(n, p, s, q);
        cartList.push(new_product);
    }
}

function get_total_quantity() {
    var total = 0;
    for (i = 0; i < cartList.length; i++) {
        total += cartList[i].product_quantity;
    }
    return total;
}

function get_total_price() {
    var total = 0;
    for (i = 0; i < cartList.length; i++) {
        var product = cartList[i];
        total += product.product_price * product.product_quantity;
    }
    return total;
}

//////////// the product object /////////////

function Product(product_name, product_price, product_shape, product_quantity) {
    this.product_name = product_name;
    this.product_price = product_price;
    this.product_shape = product_shape;
    this.product_quantity = product_quantity;
}



