<template>
    <section class="listcontainer">
        <div class="orders">
                <RouterLink to="" class="order-link"
                aria-label="`Ver detalles del pedido ${order.number}`">
                    <span class="order-info">
                        <span class="order-meta">
                            <span class="order-number">#001</span>
                            <span class="order-status">Pendiente</span>
                        </span>
                        <span class="order-name">Juana la Loca</span>
                    </span>
                    <span><i class="bi bi-chevron-right"></i></span>
                </RouterLink>
            
            
                <RouterLink to="" class="order-link"
                    aria-label="`Ver detalles del pedido ${order.number}`">
                    <span class="order-info">
                        <span class="order-meta">
                            <span class="order-number">#001</span>
                            <span class="order-status">Pendiente</span>
                        </span>
                        <span class="order-name">Adalid</span>
                    </span>
                    <span><i class="bi bi-chevron-right"></i></span>
                </RouterLink>
            
            
                <RouterLink to="" class="order-link"
                    aria-label="`Ver detalles del pedido ${order.number}`">
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
    .listcontainer{
        display: flex;
        justify-content: center;
        align-items: initial;
        flex-direction: column;
        width: 50%;
        overflow-y: scroll;
    }
    
    h3{
        font-family: var(--font-text);
        font-weight: 600;
        font-size: 1.5rem;
    }

    .orders{
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        row-gap: 1rem;
        margin-top: 2rem;
        width: 100%;
    }

    a{
        padding: .7rem;
        text-decoration: none;
        background-color: var(--color-muted);
        color: var(--color-text);
        border-radius: 25px;
        width: 90%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    .order-info{
        display: flex;
        flex-direction: column;
        justify-content: center;
        row-gap: .5rem;
        margin-left: 2rem;
    }
    
    .order-meta{
        display: flex;
        flex-direction: row;
        justify-content: center;
        column-gap: .7rem;
    }

    span.order-number, span.order-status, span.order-name{
        padding: .3rem .7rem;
        border-radius: 15px;
        width: fit-content;
        color: var(--color-bg);
        font-weight: 600;
    }

    span.order-number{
        background-color: var(--color-muted);
        font-size: small;
    }

    span.order-status{
        background-color: var(--color-warning);
        font-size: small;
    }

    span.order-name{
        background-color: var(--color-primary);
    }

    span i{
        margin-right: 2rem;
        
    }
</style>