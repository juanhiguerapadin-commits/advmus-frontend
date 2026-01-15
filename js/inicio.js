const displayMenu = document.querySelector(".displayMenu");
const sideMenu = document.getElementById("sideMenu");

displayMenu.addEventListener("click", () => {
    sideMenu.classList.toggle("active");
});



const ctx = document.getElementById('graficoFinanzas');

const valoresDemo = {
    ingresos: 150000,
    gastos: 100000,
    beneficio: 50000,
    caja: 50000,
    cobrosPendientes: 50000,
    pagosPendientes: 50000
};

new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [
            'Ingresos',
            'Gastos',
            'Beneficio Neto',
            'Saldo de Caja',
            'Cobros Pendientes',
            'Pagos Pendientes'
        ],
        datasets: [{
            label: 'Resumen financiero',
            data: [
                valoresDemo.ingresos,
                valoresDemo.gastos,
                valoresDemo.beneficio,
                valoresDemo.caja,
                valoresDemo.cobrosPendientes,
                valoresDemo.pagosPendientes
            ],
            backgroundColor: [
                '#4CAF50',
                '#F44336',
                '#2196F3',
                '#FF9800',
                '#9C27B0',
                '#607D8B'
            ],
            borderRadius: 8
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: value => '$' + value.toLocaleString()
                }
            }
        }
    }
});
