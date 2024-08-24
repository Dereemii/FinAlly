class FinancialDiagnosis {
    constructor(success, data) {
        this.success = success;
        this.data = new Data(data);
    }
}

class Data {
    constructor({ diagnosis, priorities, recommendations }) {
        this.diagnosis = new Diagnosis(diagnosis);
        this.priorities = priorities.map(priority => new Priority(priority));
        this.recommendations = recommendations;
    }
}

class Diagnosis {
    constructor({ user, total_income, total_outcomes, balance, outcome_analysis }) {
        this.user = user;
        this.total_income = total_income;
        this.total_outcomes = total_outcomes;
        this.balance = balance;
        this.outcome_analysis = outcome_analysis.map(item => new Item(item));
    }
}

class Item {
    constructor({ ammount, total_quotas, paid_quotas, remaining_quotas, monthly_payment }) {
        this.ammount = ammount;
        this.total_quotas = total_quotas;
        this.paid_quotas = paid_quotas;
        this.remaining_quotas = remaining_quotas;
        this.monthly_payment = monthly_payment;
    }
}

class Priority {
    constructor({ name, reason }) {
        this.name = name;
        this.reason = reason;
    }
}

module.exports = { FinancialDiagnosis, Data, Diagnosis, Item, Priority };
