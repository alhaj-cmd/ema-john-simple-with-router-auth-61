import React, { useEffect, useState } from 'react';
import { addToDb, deleteShoppingCart, getShoppingCart } from '../../utilities/fakedb';
import Cart from '../Cart/Cart';
import Product from '../Product/Product';
import './Shop.css';
import { Link, useLoaderData } from 'react-router-dom';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [currentPage, setcurrentPage] = useState(0);
    const [itemsPerPage, setitemsPerPage] = useState(10);
    const [cart, setCart] = useState([])
    const totalProducts = useLoaderData();

    // const itemsPerPage = 10; //TODo : make it dynamic
    const totalPages =Math.ceil(totalProducts.result / itemsPerPage);

    const pageNumbers = [...Array(totalPages).keys()];
    // console.log(pageNumbers)
   

console.log(totalProducts);

    

    // useEffect(() => {
    //     fetch('http://localhost:5000/products')
    //         .then(res => res.json())
    //         .then(data => setProducts(data))
    // }, []);

    useEffect(() => {
        // Fetch data from server based on the current page and items per page
        async function fetchData() {
          const response = await fetch(`http://localhost:5000/products?page=${currentPage}&pageSize=${itemsPerPage}`);
          const data = await response.json();
          setProducts(data);
        };
    
        fetchData();
      }, [currentPage, itemsPerPage]);

    useEffect(() => {
        const storedCart = getShoppingCart();

        const ids = Object.keys(storedCart);
         fetch(`http://localhost:5000/productsByIds`, {
            method: 'POST',
            headers: {
                'content-type' : 'application/json'
            },
            body:JSON.stringify(ids)
        })
        .then(res =>res.json())
        .then(cartProducts =>{
            const savedCart = [];
            // step 1: get id of the addedProduct
            for (const id in storedCart) {
                // step 2: get product from products state by using id
                const addedProduct = cartProducts.find(product => product._id=== id)
                if (addedProduct) {
                    // step 3: add quantity
                    const quantity = storedCart[id];
                    addedProduct.quantity = quantity;
                    // step 4: add the added product to the saved cart
                    savedCart.push(addedProduct);
                }
                // console.log('added Product', addedProduct)
            }
            // step 5: set the cart
            setCart(savedCart);
        })

        // const savedCart = [];
        // // step 1: get id of the addedProduct
        // for (const id in storedCart) {
        //     // step 2: get product from products state by using id
        //     const addedProduct = products.find(product => product._id=== id)
        //     if (addedProduct) {
        //         // step 3: add quantity
        //         const quantity = storedCart[id];
        //         addedProduct.quantity = quantity;
        //         // step 4: add the added product to the saved cart
        //         savedCart.push(addedProduct);
        //     }
        //     // console.log('added Product', addedProduct)
        // }
        // // step 5: set the cart
        // setCart(savedCart);
    }, [])

    const handleAddToCart = (product) => {
        // cart.push(product); '
        let newCart = [];
        // const newCart = [...cart, product];
        // if product doesn't exist in the cart, then set quantity = 1
        // if exist update quantity by 1
        const exists = cart.find(pd => pd._id=== product.id);
        if (!exists) {
            product.quantity = 1;
            newCart = [...cart, product]
        }
        else {
            exists.quantity = exists.quantity + 1;
            const remaining = cart.filter(pd => pd._id!== product.id);
            newCart = [...remaining, exists];
        }

        setCart(newCart);
        addToDb(product._id)
    }

    const handleClearCart = () => {
        setCart([]);
        deleteShoppingCart();
    }

    // onChange button
    const options = [5, 10, 20];
    function handleSelectChange(event) {
       setitemsPerPage(parseInt(event.target.value));
       setcurrentPage(0);
    }

    return (
      <div>
          <div className='shop-container'>
            <div className="products-container">
                {
                    products.map(product => <Product
                        key={product._id}
                        product={product}
                        handleAddToCart={handleAddToCart}
                    ></Product>)
                }
            </div>
            <div className="cart-container">
                <Cart
                    cart={cart}
                    handleClearCart={handleClearCart}
                >
                    <Link className='proceed-link' to="/orders">
                        <button className='btn-proceed'>Review Order</button>
                    </Link>
                </Cart>
            </div>
        </div>
        {/* pagination */}
        <div className="pagination">
            <p>Current Page : {currentPage}</p>
            {
                pageNumbers.map(number => <button key={number}
                    onClick={() => setcurrentPage(number)}
                    className={currentPage === number ? 'selected' : ''}
                >{number}</button>)
            }
             <select id="page-size-select" value={itemsPerPage} onChange={handleSelectChange}>
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
        </div>
      </div>
    );
};

export default Shop;