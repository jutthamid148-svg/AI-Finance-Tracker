try:
    import pandas as pd
    import numpy as np
    from sklearn.linear_model import LinearRegression
    from sklearn.preprocessing import PolynomialFeatures
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Sum
import warnings
warnings.filterwarnings('ignore')


class FinanceAnalyzer:
    """AI-powered finance analysis engine using Pandas, NumPy and Scikit-Learn"""

    def __init__(self, user):
        self.user = user
        self._load_data()

    def _load_data(self):
        from transactions.models import Income, Expense
        from budgets.models import Budget

        # Load expenses
        expenses_qs = Expense.objects.filter(user=self.user).values(
            'amount', 'category', 'date', 'created_at'
        )
        self.expenses_df = pd.DataFrame(list(expenses_qs))
        if not self.expenses_df.empty:
            self.expenses_df['amount'] = pd.to_numeric(self.expenses_df['amount'])
            self.expenses_df['date'] = pd.to_datetime(self.expenses_df['date'])
            self.expenses_df['month'] = self.expenses_df['date'].dt.month
            self.expenses_df['year'] = self.expenses_df['date'].dt.year
            self.expenses_df['month_year'] = self.expenses_df['date'].dt.to_period('M')

        # Load income
        income_qs = Income.objects.filter(user=self.user).values(
            'amount', 'source', 'date'
        )
        self.income_df = pd.DataFrame(list(income_qs))
        if not self.income_df.empty:
            self.income_df['amount'] = pd.to_numeric(self.income_df['amount'])
            self.income_df['date'] = pd.to_datetime(self.income_df['date'])
            self.income_df['month'] = self.income_df['date'].dt.month
            self.income_df['year'] = self.income_df['date'].dt.year

    def get_spending_analysis(self):
        """Analyze current month spending patterns"""
        if self.expenses_df.empty:
            return {
                'insights': ['Start adding your expenses to get AI insights!'],
                'category_breakdown': [],
                'top_category': None,
                'total_expenses': 0,
            }

        now = timezone.now()
        current_month_df = self.expenses_df[
            (self.expenses_df['month'] == now.month) &
            (self.expenses_df['year'] == now.year)
        ]

        if current_month_df.empty:
            return {
                'insights': ['No expenses recorded this month yet.'],
                'category_breakdown': [],
                'top_category': None,
                'total_expenses': 0,
            }

        total_expenses = current_month_df['amount'].sum()
        category_totals = current_month_df.groupby('category')['amount'].sum().sort_values(ascending=False)

        # Calculate monthly income
        if not self.income_df.empty:
            monthly_income = self.income_df[
                (self.income_df['month'] == now.month) &
                (self.income_df['year'] == now.year)
            ]['amount'].sum()
        else:
            monthly_income = 0

        insights = []
        category_breakdown = []

        for cat, amount in category_totals.items():
            pct = (amount / total_expenses * 100) if total_expenses > 0 else 0
            pct_income = (amount / monthly_income * 100) if monthly_income > 0 else 0
            category_breakdown.append({
                'category': cat,
                'amount': round(float(amount), 2),
                'percentage': round(float(pct), 1),
                'percentage_of_income': round(float(pct_income), 1),
            })
            if pct > 30:
                insights.append(f"You spent {pct:.0f}% of your expenses on {cat} this month.")
            if pct_income > 25:
                insights.append(f"{cat.capitalize()} is consuming {pct_income:.0f}% of your monthly income.")

        if monthly_income > 0:
            savings_rate = ((monthly_income - total_expenses) / monthly_income * 100)
            if savings_rate < 10:
                insights.append(f"Your savings rate is only {savings_rate:.0f}%. Aim for at least 20%.")
            elif savings_rate > 30:
                insights.append(f"Excellent! You're saving {savings_rate:.0f}% of your income this month.")

        top_category = category_totals.index[0] if len(category_totals) > 0 else None

        return {
            'insights': insights or ['Your spending looks balanced this month!'],
            'category_breakdown': category_breakdown,
            'top_category': top_category,
            'total_expenses': round(float(total_expenses), 2),
            'monthly_income': round(float(monthly_income), 2),
        }

    def detect_overspending(self):
        """Compare current month to previous month and detect anomalies"""
        if self.expenses_df.empty:
            return {'alerts': [], 'comparison': []}

        now = timezone.now()
        prev_month = now.month - 1 if now.month > 1 else 12
        prev_year = now.year if now.month > 1 else now.year - 1

        current = self.expenses_df[
            (self.expenses_df['month'] == now.month) & (self.expenses_df['year'] == now.year)
        ].groupby('category')['amount'].sum()

        previous = self.expenses_df[
            (self.expenses_df['month'] == prev_month) & (self.expenses_df['year'] == prev_year)
        ].groupby('category')['amount'].sum()

        alerts = []
        comparison = []

        all_categories = set(list(current.index) + list(previous.index))
        for cat in all_categories:
            curr_amt = float(current.get(cat, 0))
            prev_amt = float(previous.get(cat, 0))

            if prev_amt > 0:
                change_pct = ((curr_amt - prev_amt) / prev_amt) * 100
            else:
                change_pct = 100 if curr_amt > 0 else 0

            comparison.append({
                'category': cat,
                'current': round(curr_amt, 2),
                'previous': round(prev_amt, 2),
                'change_percentage': round(change_pct, 1),
            })

            if change_pct > 20 and curr_amt > 0:
                alerts.append(
                    f"{cat.capitalize()} expenses increased by {change_pct:.0f}% compared to last month."
                )

        return {
            'alerts': alerts or ['Spending is stable compared to last month.'],
            'comparison': sorted(comparison, key=lambda x: abs(x['change_percentage']), reverse=True),
        }

    def generate_recommendations(self):
        """Generate personalized money-saving recommendations"""
        if self.expenses_df.empty:
            return ['Add your transactions to receive personalized recommendations.']

        recommendations = []
        now = timezone.now()

        current_month_expenses = self.expenses_df[
            (self.expenses_df['month'] == now.month) & (self.expenses_df['year'] == now.year)
        ]

        if current_month_expenses.empty:
            return ['Start tracking expenses to get personalized advice!']

        category_totals = current_month_expenses.groupby('category')['amount'].sum()

        if not self.income_df.empty:
            monthly_income = float(self.income_df[
                (self.income_df['month'] == now.month) & (self.income_df['year'] == now.year)
            ]['amount'].sum())
        else:
            monthly_income = float(category_totals.sum()) * 1.5

        # Food recommendations
        if 'food' in category_totals and monthly_income > 0:
            food_pct = float(category_totals['food']) / monthly_income * 100
            if food_pct > 20:
                potential_save = float(category_totals['food']) * 0.15
                recommendations.append(
                    f"You can save ₨{potential_save:,.0f} monthly by reducing restaurant visits and cooking at home more."
                )

        # Entertainment
        if 'entertainment' in category_totals:
            ent_amt = float(category_totals['entertainment'])
            if ent_amt > 5000:
                recommendations.append(
                    f"Consider streaming services instead of cinema — could save ₨{ent_amt * 0.3:,.0f}/month."
                )

        # Shopping
        if 'shopping' in category_totals and monthly_income > 0:
            shop_pct = float(category_totals['shopping']) / monthly_income * 100
            if shop_pct > 15:
                recommendations.append("Try the 24-hour rule before purchases — wait a day before buying non-essentials.")

        # Transport
        if 'transport' in category_totals:
            transport_amt = float(category_totals['transport'])
            if transport_amt > 8000:
                recommendations.append(
                    f"Carpooling or public transport could reduce your ₨{transport_amt:,.0f} transport cost significantly."
                )

        # Savings rate
        total_expenses = float(current_month_expenses['amount'].sum())
        savings_rate = ((monthly_income - total_expenses) / monthly_income * 100) if monthly_income > 0 else 0
        if savings_rate < 20:
            target_save = monthly_income * 0.20 - max(monthly_income - total_expenses, 0)
            recommendations.append(
                f"Aim to save 20% of your income. You need to reduce expenses by ₨{max(target_save, 0):,.0f} more."
            )

        return recommendations or ['Great job managing your finances! Keep up the good work.']

    def predict_next_month_expenses(self):
        """Use Linear Regression to predict next month expenses"""
        if self.expenses_df.empty or len(self.expenses_df) < 3:
            return {
                'prediction': 0,
                'confidence': 'low',
                'predictions_by_category': [],
                'message': 'Need more data for accurate predictions (at least 3 months).',
            }

        # Group by month
        monthly_totals = self.expenses_df.groupby(
            ['year', 'month']
        )['amount'].sum().reset_index()
        monthly_totals = monthly_totals.sort_values(['year', 'month'])

        if len(monthly_totals) < 2:
            return {
                'prediction': float(monthly_totals['amount'].mean()),
                'confidence': 'low',
                'predictions_by_category': [],
                'message': 'Limited data — prediction based on average spending.',
            }

        # Create time index
        monthly_totals['t'] = range(len(monthly_totals))
        X = monthly_totals[['t']].values
        y = monthly_totals['amount'].values.astype(float)

        # Polynomial regression for better fit
        poly = PolynomialFeatures(degree=2)
        X_poly = poly.fit_transform(X)
        model = LinearRegression()
        model.fit(X_poly, y)

        next_t = np.array([[len(monthly_totals)]])
        next_t_poly = poly.transform(next_t)
        prediction = float(model.predict(next_t_poly)[0])
        prediction = max(prediction, 0)

        # Predict by category
        categories = self.expenses_df['category'].unique()
        cat_predictions = []
        for cat in categories:
            cat_df = self.expenses_df[self.expenses_df['category'] == cat]
            cat_monthly = cat_df.groupby(['year', 'month'])['amount'].sum().reset_index()
            cat_monthly = cat_monthly.sort_values(['year', 'month'])
            if len(cat_monthly) >= 2:
                cat_monthly['t'] = range(len(cat_monthly))
                X_c = cat_monthly[['t']].values
                y_c = cat_monthly['amount'].values.astype(float)
                m = LinearRegression()
                m.fit(X_c, y_c)
                cat_pred = float(m.predict([[len(cat_monthly)]])[0])
                cat_predictions.append({
                    'category': cat,
                    'predicted_amount': round(max(cat_pred, 0), 2),
                })
            else:
                cat_predictions.append({
                    'category': cat,
                    'predicted_amount': round(float(cat_df['amount'].mean()), 2),
                })

        confidence = 'high' if len(monthly_totals) >= 4 else 'medium' if len(monthly_totals) >= 2 else 'low'

        return {
            'prediction': round(prediction, 2),
            'confidence': confidence,
            'predictions_by_category': cat_predictions,
            'months_analyzed': len(monthly_totals),
            'message': f'Prediction based on {len(monthly_totals)} months of data.',
        }

    def predict_savings(self):
        """Predict future savings based on income and expense trends"""
        if self.income_df.empty:
            return {'predictions': [], 'message': 'Add income records for savings predictions.'}

        now = timezone.now()
        monthly_income = float(self.income_df[
            (self.income_df['month'] == now.month) & (self.income_df['year'] == now.year)
        ]['amount'].sum())

        next_month_expenses = self.predict_next_month_expenses()['prediction']
        predicted_savings = monthly_income - next_month_expenses

        avg_monthly_savings = predicted_savings
        predictions = []
        for i in range(1, 7):
            target_date = now + timedelta(days=30 * i)
            predictions.append({
                'month': target_date.strftime('%B %Y'),
                'predicted_savings': round(max(avg_monthly_savings, 0), 2),
                'cumulative_savings': round(max(avg_monthly_savings * i, 0), 2),
            })

        return {
            'predictions': predictions,
            'monthly_income': round(monthly_income, 2),
            'predicted_expenses': round(next_month_expenses, 2),
            'predicted_savings': round(max(predicted_savings, 0), 2),
            'message': 'Based on current income and expense trends.',
        }

    def chat_response(self, question):
        """Generate intelligent AI chat responses about user's finances"""
        question_lower = question.lower()

        # Get relevant data
        analysis = self.get_spending_analysis()
        predictions = self.predict_next_month_expenses()
        recommendations = self.generate_recommendations()
        overspending = self.detect_overspending()

        if any(word in question_lower for word in ['save', 'saving', 'more money', 'savings']):
            response = "💡 **How to Save More Money**\n\n"
            response += "Based on your spending patterns:\n\n"
            for rec in recommendations[:3]:
                response += f"• {rec}\n"
            savings_data = self.predict_savings()
            if savings_data['predictions']:
                response += f"\n📈 If you follow these tips, you could save approximately ₨{savings_data['predicted_savings']:,.0f} next month."

        elif any(word in question_lower for word in ['most', 'highest', 'expensive', 'top spending', 'costs most']):
            if analysis['category_breakdown']:
                top = analysis['category_breakdown'][0]
                response = f"📊 **Highest Spending Category**\n\n"
                response += f"This month, **{top['category'].capitalize()}** is your top expense at ₨{top['amount']:,.0f} "
                response += f"({top['percentage']}% of total spending).\n\n"
                response += "**Full breakdown:**\n"
                for item in analysis['category_breakdown'][:5]:
                    response += f"• {item['category'].capitalize()}: ₨{item['amount']:,.0f} ({item['percentage']}%)\n"
            else:
                response = "No expense data available yet. Start adding your expenses!"

        elif any(word in question_lower for word in ['next month', 'predict', 'future', 'forecast', 'expected']):
            response = f"🔮 **Next Month Expense Prediction**\n\n"
            response += f"Based on your spending history, I predict you'll spend approximately **₨{predictions['prediction']:,.0f}** next month.\n\n"
            response += f"Confidence level: {predictions['confidence'].upper()}\n\n"
            if predictions['predictions_by_category']:
                response += "**By category:**\n"
                for cat in predictions['predictions_by_category'][:5]:
                    response += f"• {cat['category'].capitalize()}: ₨{cat['predicted_amount']:,.0f}\n"

        elif any(word in question_lower for word in ['budget', 'budget status', 'budget overview']):
            response = "📋 **Budget Overview**\n\nCheck the Budget section in your dashboard for a detailed breakdown with visual progress bars."

        elif any(word in question_lower for word in ['overspend', 'over budget', 'exceed', 'too much']):
            response = "⚠️ **Overspending Analysis**\n\n"
            if overspending['alerts']:
                for alert in overspending['alerts']:
                    response += f"• {alert}\n"
            else:
                response += "Your spending is stable compared to last month. Great job!"

        elif any(word in question_lower for word in ['income', 'earning', 'salary']):
            if not self.income_df.empty:
                total = float(self.income_df['amount'].sum())
                response = f"💰 **Your Income Summary**\n\nTotal recorded income: ₨{total:,.0f}\n"
            else:
                response = "No income records found. Add your income to get insights!"

        elif any(word in question_lower for word in ['hello', 'hi', 'hey', 'help']):
            response = "👋 **Hello! I'm your AI Finance Assistant.**\n\n"
            response += "I can help you with:\n"
            response += "• 💰 How can I save more money?\n"
            response += "• 📊 Which category costs me the most?\n"
            response += "• 🔮 What's my expected spending next month?\n"
            response += "• ⚠️ Am I overspending anywhere?\n"
            response += "• 📋 Budget analysis and recommendations\n\n"
            response += "Just ask me anything about your finances!"

        else:
            response = f"💬 I analyzed your finances based on your question.\n\n"
            if analysis['insights']:
                response += "**Key Insights:**\n"
                for insight in analysis['insights'][:2]:
                    response += f"• {insight}\n"
            response += f"\n**Recommendations:**\n"
            for rec in recommendations[:2]:
                response += f"• {rec}\n"

        return response
