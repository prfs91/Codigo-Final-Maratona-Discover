const Modal = {
    open(){
        // Abrir modal
        // Adicionar a class active ao modal
        document
            .querySelector('.modal-overlay')
            .classList
            .add('active')
    },

    close(){
        // Fechar Modal
        // Remover a class active do modal
        document
            .querySelector('.modal-overlay')
            .classList
            .remove('active')
    }
    //estudar toogle e tentar substituir
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [] //transforma de string para array ou objeto
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions)) //transforma de array para string
    }
}

//Eu preciso somar as entradas
//depois eu preciso somar as saídas e
//remover das entradas o valor das saídas
//assim, eu terei o total
const Transaction = {
    /* all: [
        {
            description:'Luz',
            amount: -50001,
            date: '23/01/2021'
        },
    
        {
            description:'Website',
            amount: 500000,
            date: '23/01/2021'
        },
    
        {
            description:'Internet',
            amount: -20012,
            date: '23/01/2021'
        },
    
        {
            description:'App',
            amount: 200000,
            date: '23/01/2021'
        }
    ],
    
    substituído pelo código abaixo all*/

    all: Storage.get(),

    add(transaction){
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    //somar as entradas
    incomes() {
        let income = 0;
        // pegar todas as transações
        // para cada transação,
        Transaction.all.forEach(transaction => {
            // se ela for maior que zero
            if (transaction.amount > 0) {
                // somar a uma variável e retornar a variável
                income += transaction.amount;
            }
        })
        return income;
    },

    //somar as saídas
    expenses() {
        let expense = 0;
        // pegar todas as transações
        // para cada transação,
        Transaction.all.forEach(transaction => {
            // se ela for menor que zero
            if (transaction.amount < 0) {
                // somar a uma variável e retornar a variável
                expense += transaction.amount;
            }
        })
        return expense;
    },

    //entradas - saídas
    total() {
        return Transaction.incomes() + Transaction.expenses();
    }
}

//Substituir os dados do HTML com os do JS
const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income": "expense"
        
        const amount = Utils.formatCurrency(transaction.amount)
        //const amount = transaction.amount(Utils)
        
        const html = `
        <tr>
            <td class="description">${transaction.description}</td>
            <td class=${CSSclass}>${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
            </td>
        </tr>
        `

        return html
    },

    // responsável por deixar bonito na tela, visual
    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions () {
        DOM.transactionsContainer.innerHTML = ""
    }
}

//trabalha com os sinais, remove caracteres especiais, formata em moeda...
const Utils = {

    formatAmount(value) {
        
        value *= 100

        return Math.round(value)
    },

    formatDate(date) {

        const splittedDate = date.split("-")

        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`

    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "") 
        /* 
        
        \D dentro de // acha tudo que não for caracter que não seja número e no caso vai substituir por vazio "" 
            // --> define a expressão regular
            g --> faz uma pesquisa global
            \D --> acha os caracteres não numéricos
        
        */

        value = Number(value) / 100 //nessa situação coloca as duas casas decimais do valor

        //transforma o nosso valor em moeda
        value = value.toLocaleString("pt-BR", {
            style: "currency", // estilo moeda
            currency:"BRL" // real brasileiro
        })

        return signal + value


    }
}

const Form = {

    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
    
    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields() {

        const {description, amount, date} = Form.getValues()
        
        if (description.trim() == "" || // trim faz uma limpeza de espaços vazios
            amount.trim() == "" || 
            date.trim() == "") {
                throw new Error("Por favor, preencha todos os campos")
            } 
    },

    formatValues() {
        let {description, amount, date} = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()

        try {

            // Verificar se todas as informações foram preenchidas
            Form.validateFields()

            // Formatar os dados para salvar
            const transaction = Form.formatValues()

            // Salvar
            Transaction.add(transaction)
            
            // Apagar os dados do formulário
            Form.clearFields()

            // Modal fecha
            Modal.close()


        } catch (error) {
            alert(error.message)
        }

    }

}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction)
        
        DOM.updateBalance()
        
        Storage.set(Transaction.all)
    },

    reload() {
        DOM.clearTransactions()
        App.init()
    }
}

App.init()