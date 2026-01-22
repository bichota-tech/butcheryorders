<template>
    <section class="container">
        <h2>Pedidos</h2>
        <div class="card-container">
            <article class="order-card">
                <header class="order-card_header">
                    <span class="order-id">#001</span>
                    <span class="order-status">Pendiente</span>
                </header>

                <div class="order-card_dates">
                    <span class="order-date" data-type="current">Actual: 15/01/2026</span>
                    <span class="order-date" data-type="pickup">Recogida: 18/01/2026</span>
                </div>

                <div class="order-card_customer">
                    <span class="customer-name">Nombre: Juan Pérez</span>
                    <span class="customer-phone">Tlf: 600 123 456</span>
                </div>

                <ul class="order-card_products">
                    <li class="product">
                        <span class="product-name">Entrecot </span>
                        <span class="product-qty">2 kg</span>
                    </li>
                    <li class="product">
                        <span class="product-name">Hamburguesas </span>
                        <span class="product-qty">6 uds</span>
                    </li>
                </ul>

                <footer class="order-card_footer">
                    <span class="order-total">2 productos</span>
                    <button class="order-action">Cambiar estado</button>
                </footer>
            </article>
        </div>
    </section>
</template>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-block: 3rem;
    font-family: var(--font-text);
}

h2 {
    font-size: 1.8rem;
    color: var(--color-text);
    font-weight: 600;
}

.card-container{
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: .8rem;
    justify-content: center;
    align-items: center;
    margin-block: 1.5rem;
}

.order-card {
    padding: 1.5rem;
    color: var(--color-text);
    background-color: var(--color-bg);
    box-shadow: 0 4px 30px rgba(120, 0, 0, 0.3);
    backdrop-filter: blur(4.7px);
    -webkit-backdrop-filter: blur(4.7px);
    border: 1px solid rgba(120, 0, 0, 0.3);
    border-radius: 20px;
    width: fit-content;
    height: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    row-gap: .8rem;
}

.order-card_header {
    text-align: center;
    display: flex;
    column-gap: .5rem;
}

span.order-id{
    padding: .2rem .4rem;
    border-radius: 10px;
    background-color: var(--color-warning);
    font-size: small;
    color: var(--color-bg);
    font-weight: 600;
}

span.order-status{
    padding: .2rem .4rem;
    border-radius: 10px;
    background-color: var(--color-success);
    font-size: small;
    color: var(--color-bg);
    font-weight: 600;
}

.order-card_dates{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-bottom: .5rem;
    border-bottom: 2px solid var(--color-success);
    font-weight: 600;
}

.order-card_customer{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-bottom: .5rem;
    border-bottom: 2px solid var(--color-success);
    font-weight: 600;
}

li.product{
    font-weight: 600; 
}

.order-card_footer{
    display: flex;
    column-gap: .8rem;
}

</style>

<script setup>
</script>
