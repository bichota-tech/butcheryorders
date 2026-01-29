<template>
    <section class="container">
        <div class="dashcontainer">
            <div class="counter orders">
                <div class="icon" style="border:2px solid var(--color-primary);">
                    <i class="bi bi-bag-check" style="color: var(--color-primary);"></i>
                </div>
                <div class="content">
                    <span>Pedidos hoy</span>
                    <div id="number">
                        <span>5</span>
                    </div>
                </div>
            </div>

            <div class="counter pending">
                <div class="icon"style="border:2px solid var(--color-warning);">
                    <i class="bi bi-clock-history" style="color: var(--color-warning);"></i>
                </div>
                <div class="content">
                    <span>Pendientes</span>
                    <div id="number">
                        <span>5</span>
                    </div>
                </div>
            </div>

            <div class="counter completed">
                <div class="icon" style="border:2px solid var(--color-success);">
                    <i class="bi bi-check2-circle" style="color: var(--color-success);"></i>
                </div>
                <div class="content">
                    <span>Completados</span>
                    <div id="number">
                        <span>5</span>
                    </div>
                </div>
            </div>

            <div class="counter sold">
                <div class="icon"style="border:2px solid var(--color-secondary);">
                    <i class="bi bi-graph-up-arrow" style="color: var(--color-secondary);"></i>
                </div>
                <div class="content">
                    <span>Ventas hoy</span>
                    <div id="number">
                        <span>5</span>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup></script>
<style scoped>
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 60%;
}

.dashcontainer {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 1.8rem;
}

.counter {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: left;
    column-gap: 1rem;
    padding: 1.5rem 2rem 1.5rem 1rem;
    width: 45%;
    color: var(--color-secundary);
    background: rgba(248, 248, 248, 0.7);
    border-radius: 16px;
    box-shadow: 0 4px 30px rgba(120, 0, 0, 0.3);
    backdrop-filter: blur(4.7px);
    -webkit-backdrop-filter: blur(4.7px);
    border: 1px solid rgba(120, 0, 0, 0.3);
}

.icon{
    display: flex;
    place-items: center;
    border-radius: 10px;
    background-color:rgb(219, 217, 217);
}

.icon i{
    font-size: 1.5rem;
    padding-inline: .8rem;
    
}

.content{
    font-family: var(--font-text);
    font-weight: 600;
    font-size: 1rem;
}
</style>