<template>
    <section class="ordercontainer">
        <h2>Pedidos Recientes</h2>
        <div class="orders">
            <RouterLink to="/pedidos" class="order-link" aria-label="Ver detalles del pedido #001">
                <span class="order-info">
                    <span class="order-meta">
                        <span class="order-number">#001</span>
                        <span class="order-status">Pendiente</span>
                    </span>
                    <span class="order-name">Juana la Loca</span>
                </span>
                <span><i class="bi bi-chevron-right"></i></span>
            </RouterLink>

            <RouterLink to="/pedidos" class="order-link" aria-label="Ver detalles del pedido #001">
                <span class="order-info">
                    <span class="order-meta">
                        <span class="order-number">#001</span>
                        <span class="order-status">Pendiente</span>
                    </span>
                    <span class="order-name">Adalid</span>
                </span>
                <span><i class="bi bi-chevron-right"></i></span>
            </RouterLink>

            <RouterLink to="/pedidos" class="order-link" aria-label="Ver detalles del pedido #001">
                <span class="order-info">
                    <span class="order-meta">
                        <span class="order-number">#001</span>
                        <span class="order-status">Pendiente</span>
                    </span>
                    <span class="order-name">Adalid</span>
                </span>
                <span><i class="bi bi-chevron-right"></i></span>
            </RouterLink>
        </div>
    </section>
</template>
<script setup></script>
<style scoped>
.ordercontainer {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding: 1rem;
    background-color: rgba(120, 0, 0, 0.596);
    padding-block: 3rem;
}

h2 {
    font-family: var(--font-text);
    font-size: 1.8rem;
    color: var(--color-bg);
}

.orders {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    row-gap: 1rem;
    padding: 1rem;
    width: 80%;
}

a.order-link {
    text-decoration: none;
    padding: .5rem;
    width: 80%;
    border-radius: 25px;
    color: var(--color-text);
    background-color: var(--color-bg);
    box-shadow: 0 4px 30px rgba(120, 0, 0, 0.3);
    backdrop-filter: blur(4.7px);
    -webkit-backdrop-filter: blur(4.7px);
    border: 1px solid rgba(120, 0, 0, 0.3);
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.order-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    row-gap: .3rem;
    margin-left: 1rem;
}

.order-meta {
    display: flex;
    flex-direction: row;
    justify-content: center;
    column-gap: .3rem;
}

span.order-number,
span.order-status,
span.order-name {
    padding: .3rem .7rem;
    border-radius: 15px;
    width: fit-content;
    color: var(--color-bg);
    font-weight: 600;
    font-size: small;
}

span.order-number {
    background-color: var(--color-muted);
}

span.order-status {
    background-color: var(--color-warning);
}

span.order-name {
    background-color: var(--color-primary);
}

span i {
    margin-right: 1rem;
    color: rgba(120, 0, 0, 0.897);
    font-size: larger;
}

</style>