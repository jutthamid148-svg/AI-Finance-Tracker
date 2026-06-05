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
        self._prediction_cache = None
        self._load_data()

    def _load_data(self):
        if not ML_AVAILABLE:
            raise ImportError('pandas, numpy, and scikit-learn are required for AI features.')
        from transactions.models import Income, Expense

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

        income_qs = Income.objects.filter(user=self.user).values(
            'amount', 'source', 'date'
        )
        self.income_df = pd.DataFrame(list(income_qs))
        if not self.income_df.empty:
            self.income_df['amount'] = pd.to_numeric(self.income_df['amount'])
            self.income_df['date'] = pd.to_datetime(self.income_df['date'])
            self.income_df['month'] = self.income_df['date'].dt.month
            self.income_df['year'] = self.income_df['date'].dt.year

    # ──────────────────────────────────────────────────────────────────────────
    def get_spending_analysis(self):
        """Analyze current month spending patterns"""
        if self.expenses_df.empty:
            return {
                'insights': ['Start adding your expenses to get AI insights!'],
                'category_breakdown': [],
                'top_category': None,
                'total_expenses': 0,
                'monthly_income': 0,
                'savings_rate': 0,
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
                'monthly_income': 0,
                'savings_rate': 0,
            }

        total_expenses = current_month_df['amount'].sum()
        category_totals = current_month_df.groupby('category')['amount'].sum().sort_values(ascending=False)

        monthly_income = 0.0
        if not self.income_df.empty:
            monthly_income = float(self.income_df[
                (self.income_df['month'] == now.month) &
                (self.income_df['year'] == now.year)
            ]['amount'].sum())

        savings_rate = 0.0
        if monthly_income > 0:
            savings_rate = round(((monthly_income - float(total_expenses)) / monthly_income) * 100, 1)

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
                insights.append(
                    f"⚠️ {cat.capitalize()} is your biggest expense at {pct:.0f}% of total spending (₨{amount:,.0f})."
                )
            if pct_income > 25:
                insights.append(
                    f"📌 {cat.capitalize()} is consuming {pct_income:.0f}% of your monthly income — consider cutting back."
                )

        if monthly_income > 0:
            if savings_rate < 0:
                insights.append(f"🚨 You are spending ₨{abs(monthly_income - float(total_expenses)):,.0f} MORE than your income this month!")
            elif savings_rate < 10:
                insights.append(f"⚠️ Your savings rate is only {savings_rate:.0f}%. Financial experts recommend saving at least 20%.")
            elif savings_rate >= 30:
                insights.append(f"🌟 Outstanding! You're saving {savings_rate:.0f}% of your income. Keep it up!")
            elif savings_rate >= 20:
                insights.append(f"✅ Good job! You're saving {savings_rate:.0f}% of your income this month.")

        top_category = category_totals.index[0] if len(category_totals) > 0 else None

        return {
            'insights': insights or ['Your spending looks balanced this month!'],
            'category_breakdown': category_breakdown,
            'top_category': top_category,
            'total_expenses': round(float(total_expenses), 2),
            'monthly_income': round(float(monthly_income), 2),
            'savings_rate': savings_rate,
        }

    # ──────────────────────────────────────────────────────────────────────────
    def detect_overspending(self):
        """Compare current month to previous month"""
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

        for cat in set(list(current.index) + list(previous.index)):
            curr_amt = float(current.get(cat, 0))
            prev_amt = float(previous.get(cat, 0))
            change_pct = ((curr_amt - prev_amt) / prev_amt * 100) if prev_amt > 0 else (100 if curr_amt > 0 else 0)

            comparison.append({
                'category': cat,
                'current': round(curr_amt, 2),
                'previous': round(prev_amt, 2),
                'change_percentage': round(change_pct, 1),
            })

            if change_pct > 20 and curr_amt > 0:
                alerts.append(
                    f"⚠️ {cat.capitalize()} expenses increased by {change_pct:.0f}% vs last month (₨{prev_amt:,.0f} → ₨{curr_amt:,.0f})."
                )

        return {
            'alerts': alerts or ['✅ Spending is stable compared to last month.'],
            'comparison': sorted(comparison, key=lambda x: abs(x['change_percentage']), reverse=True),
        }

    # ──────────────────────────────────────────────────────────────────────────
    def generate_recommendations(self):
        """Generate personalized money-saving recommendations"""
        if self.expenses_df.empty:
            return ['Add your transactions to receive personalized recommendations.']

        now = timezone.now()
        current_month_expenses = self.expenses_df[
            (self.expenses_df['month'] == now.month) & (self.expenses_df['year'] == now.year)
        ]

        if current_month_expenses.empty:
            return ['Start tracking expenses to get personalized advice!']

        category_totals = current_month_expenses.groupby('category')['amount'].sum()
        total = float(category_totals.sum())

        monthly_income = float(self.income_df[
            (self.income_df['month'] == now.month) & (self.income_df['year'] == now.year)
        ]['amount'].sum()) if not self.income_df.empty else total * 1.5

        recommendations = []

        if 'food' in category_totals and monthly_income > 0:
            food_pct = float(category_totals['food']) / monthly_income * 100
            if food_pct > 20:
                save = float(category_totals['food']) * 0.15
                recommendations.append(
                    f"🍳 Cook at home more often — you could save ₨{save:,.0f}/month by reducing restaurant visits by 15%."
                )

        if 'entertainment' in category_totals:
            ent = float(category_totals['entertainment'])
            if ent > 5000:
                recommendations.append(
                    f"🎬 Consider streaming services instead of cinema outings — could save ₨{ent * 0.3:,.0f}/month."
                )

        if 'shopping' in category_totals and monthly_income > 0:
            shop_pct = float(category_totals['shopping']) / monthly_income * 100
            if shop_pct > 15:
                recommendations.append(
                    f"🛍️ Apply the 24-hour rule before non-essential purchases — your shopping is {shop_pct:.0f}% of income."
                )

        if 'transport' in category_totals:
            tr = float(category_totals['transport'])
            if tr > 8000:
                recommendations.append(
                    f"🚌 Carpooling or public transport could cut your ₨{tr:,.0f} transport cost by up to 40%."
                )

        if monthly_income > 0:
            savings_rate = (monthly_income - total) / monthly_income * 100
            if savings_rate < 20:
                shortfall = max(monthly_income * 0.20 - max(monthly_income - total, 0), 0)
                recommendations.append(
                    f"💰 To reach the 20% savings goal, reduce your expenses by ₨{shortfall:,.0f} more this month."
                )
            if savings_rate >= 20:
                invest_amt = max(monthly_income - total, 0) * 0.5
                recommendations.append(
                    f"📈 Great savings! Consider investing ₨{invest_amt:,.0f} monthly in a savings account or mutual funds."
                )

        return recommendations or ['🏆 Excellent financial management! Keep maintaining your current habits.']

    # ──────────────────────────────────────────────────────────────────────────
    def predict_next_month_expenses(self):
        """Use Polynomial Regression to predict next 3 months expenses"""
        if self._prediction_cache is not None:
            return self._prediction_cache

        if self.expenses_df.empty or len(self.expenses_df) < 3:
            return {
                'prediction': 0,
                'confidence': 'low',
                'predictions_by_category': [],
                'monthly_predictions': [],
                'message': 'Need at least 3 expense entries for predictions.',
            }

        monthly_totals = self.expenses_df.groupby(
            ['year', 'month']
        )['amount'].sum().reset_index().sort_values(['year', 'month'])

        if len(monthly_totals) < 2:
            avg = float(monthly_totals['amount'].mean())
            now = timezone.now()
            return {
                'prediction': round(avg, 2),
                'confidence': 'low',
                'predictions_by_category': [],
                'monthly_predictions': [
                    {
                        'month': (now + timedelta(days=30 * i)).strftime('%b %Y'),
                        'predicted': round(avg, 2),
                    }
                    for i in range(1, 4)
                ],
                'message': 'Limited data — prediction based on average.',
            }

        monthly_totals['t'] = range(len(monthly_totals))
        X = monthly_totals[['t']].values
        y = monthly_totals['amount'].values.astype(float)

        degree = 2 if len(monthly_totals) >= 4 else 1
        poly = PolynomialFeatures(degree=degree)
        X_poly = poly.fit_transform(X)
        model = LinearRegression()
        model.fit(X_poly, y)

        now = timezone.now()
        n = len(monthly_totals)

        # Next 3 months predictions
        monthly_predictions = []
        for i in range(1, 4):
            t_next = np.array([[n + i - 1]])
            pred = float(model.predict(poly.transform(t_next))[0])
            target = now + timedelta(days=30 * i)
            monthly_predictions.append({
                'month': target.strftime('%b %Y'),
                'predicted': round(max(pred, 0), 2),
            })

        prediction = monthly_predictions[0]['predicted']

        # Category predictions
        categories = self.expenses_df['category'].unique()
        cat_predictions = []
        for cat in categories:
            cat_df = self.expenses_df[self.expenses_df['category'] == cat]
            cat_monthly = cat_df.groupby(['year', 'month'])['amount'].sum().reset_index().sort_values(['year', 'month'])
            if len(cat_monthly) >= 2:
                cat_monthly['t'] = range(len(cat_monthly))
                m = LinearRegression()
                m.fit(cat_monthly[['t']].values, cat_monthly['amount'].values.astype(float))
                cat_pred = float(m.predict([[len(cat_monthly)]])[0])
            else:
                cat_pred = float(cat_df['amount'].mean())
            cat_predictions.append({
                'category': cat,
                'predicted_amount': round(max(cat_pred, 0), 2),
            })

        cat_predictions.sort(key=lambda x: x['predicted_amount'], reverse=True)

        confidence = 'high' if n >= 4 else 'medium' if n >= 2 else 'low'

        self._prediction_cache = {
            'prediction': prediction,
            'confidence': confidence,
            'predictions_by_category': cat_predictions,
            'monthly_predictions': monthly_predictions,
            'months_analyzed': n,
            'message': f'Prediction based on {n} months of data using Polynomial Regression.',
        }
        return self._prediction_cache

    # ──────────────────────────────────────────────────────────────────────────
    def predict_savings(self):
        """Predict future savings based on income and expense trends"""
        if self.income_df.empty:
            return {'predictions': [], 'message': 'Add income records for savings predictions.'}

        now = timezone.now()
        monthly_income = float(self.income_df[
            (self.income_df['month'] == now.month) & (self.income_df['year'] == now.year)
        ]['amount'].sum())

        exp_data = self.predict_next_month_expenses()
        next_month_expenses = exp_data['prediction']
        predicted_savings = monthly_income - next_month_expenses

        predictions = []
        monthly_preds = exp_data.get('monthly_predictions', [])
        cumulative = 0.0
        for i in range(1, 7):
            target_date = now + timedelta(days=30 * i)
            if i <= len(monthly_preds):
                exp = monthly_preds[i - 1]['predicted']
            else:
                exp = next_month_expenses
            sav = max(monthly_income - exp, 0)
            cumulative += sav
            predictions.append({
                'month': target_date.strftime('%B %Y'),
                'predicted_savings': round(sav, 2),
                'cumulative_savings': round(cumulative, 2),
                'predicted_expenses': round(exp, 2),
            })

        return {
            'predictions': predictions,
            'monthly_income': round(monthly_income, 2),
            'predicted_expenses': round(next_month_expenses, 2),
            'predicted_savings': round(max(predicted_savings, 0), 2),
            'message': 'Based on current income and ML expense trend.',
        }

    # ──────────────────────────────────────────────────────────────────────────
    def get_financial_health_score(self):
        """Calculate a 0-100 financial health score with breakdown"""
        now = timezone.now()
        score = 0
        breakdown = []

        # 1. Income tracking — 20 pts
        if not self.income_df.empty:
            cur_income = float(self.income_df[
                (self.income_df['month'] == now.month) &
                (self.income_df['year'] == now.year)
            ]['amount'].sum())
            pts = 20 if cur_income > 0 else 8
            score += pts
            breakdown.append({
                'metric': 'Income Recorded',
                'score': pts, 'max': 20,
                'status': 'good' if pts == 20 else 'warning',
                'value': f'₨{cur_income:,.0f}',
            })
        else:
            breakdown.append({'metric': 'Income Recorded', 'score': 0, 'max': 20, 'status': 'bad', 'value': 'None'})

        # 2. Savings rate — 30 pts
        if not self.income_df.empty and not self.expenses_df.empty:
            mi = float(self.income_df[
                (self.income_df['month'] == now.month) & (self.income_df['year'] == now.year)
            ]['amount'].sum())
            me = float(self.expenses_df[
                (self.expenses_df['month'] == now.month) & (self.expenses_df['year'] == now.year)
            ]['amount'].sum())
            sr = max((mi - me) / mi * 100, 0) if mi > 0 else 0
            if sr >= 30:
                pts, st = 30, 'excellent'
            elif sr >= 20:
                pts, st = 24, 'good'
            elif sr >= 10:
                pts, st = 15, 'warning'
            else:
                pts, st = 5, 'bad'
            score += pts
            breakdown.append({'metric': 'Savings Rate', 'score': pts, 'max': 30, 'status': st, 'value': f'{sr:.0f}%'})
        else:
            breakdown.append({'metric': 'Savings Rate', 'score': 0, 'max': 30, 'status': 'bad', 'value': 'N/A'})

        # 3. Expense history — 20 pts
        if not self.expenses_df.empty:
            months = len(self.expenses_df.groupby(['year', 'month']))
            pts = min(months * 5, 20)
            score += pts
            breakdown.append({
                'metric': 'Expense History',
                'score': pts, 'max': 20,
                'status': 'good' if months >= 4 else 'warning',
                'value': f'{months} month{"s" if months != 1 else ""}',
            })
        else:
            breakdown.append({'metric': 'Expense History', 'score': 0, 'max': 20, 'status': 'bad', 'value': '0 months'})

        # 4. Spending control — 15 pts
        if not self.income_df.empty and not self.expenses_df.empty:
            mi = float(self.income_df[
                (self.income_df['month'] == now.month) & (self.income_df['year'] == now.year)
            ]['amount'].sum())
            me = self.expenses_df[
                (self.expenses_df['month'] == now.month) & (self.expenses_df['year'] == now.year)
            ]
            if mi > 0 and not me.empty:
                max_pct = float(me.groupby('category')['amount'].sum().max()) / mi * 100
                if max_pct <= 20:
                    pts, st = 15, 'good'
                elif max_pct <= 35:
                    pts, st = 10, 'warning'
                else:
                    pts, st = 3, 'bad'
                score += pts
                breakdown.append({'metric': 'Spending Control', 'score': pts, 'max': 15, 'status': st, 'value': f'Top cat: {max_pct:.0f}% of income'})
            else:
                breakdown.append({'metric': 'Spending Control', 'score': 5, 'max': 15, 'status': 'warning', 'value': 'N/A'})
                score += 5
        else:
            breakdown.append({'metric': 'Spending Control', 'score': 0, 'max': 15, 'status': 'bad', 'value': 'N/A'})

        # 5. Prediction accuracy — 15 pts
        conf = self.predict_next_month_expenses().get('confidence', 'low')
        pts = {'high': 15, 'medium': 10, 'low': 5}.get(conf, 5)
        score += pts
        breakdown.append({'metric': 'Data Richness', 'score': pts, 'max': 15, 'status': 'good' if conf == 'high' else 'warning' if conf == 'medium' else 'bad', 'value': f'{conf.capitalize()} confidence'})

        # Grade
        if score >= 80:
            grade, label, color = 'A', 'Excellent', 'success'
        elif score >= 65:
            grade, label, color = 'B', 'Good', 'primary'
        elif score >= 50:
            grade, label, color = 'C', 'Fair', 'warning'
        else:
            grade, label, color = 'D', 'Needs Work', 'danger'

        return {
            'score': score,
            'grade': grade,
            'label': label,
            'color': color,
            'breakdown': breakdown,
        }

    # ──────────────────────────────────────────────────────────────────────────
    def chat_response(self, question):
        """Generate intelligent AI chat responses about user's finances"""
        q = question.lower()
        analysis = self.get_spending_analysis()
        predictions = self.predict_next_month_expenses()
        recommendations = self.generate_recommendations()
        overspending = self.detect_overspending()

        if any(w in q for w in ['save', 'saving', 'more money', 'savings']):
            response = "💡 **How to Save More Money**\n\nBased on your spending patterns:\n\n"
            for rec in recommendations[:3]:
                response += f"• {rec}\n"
            sav = self.predict_savings()
            if sav.get('predictions'):
                response += f"\n📈 Predicted savings next month: **₨{sav['predicted_savings']:,.0f}**"

        elif any(w in q for w in ['most', 'highest', 'expensive', 'top spending', 'costs most']):
            if analysis['category_breakdown']:
                top = analysis['category_breakdown'][0]
                response = f"📊 **Highest Spending Category**\n\n**{top['category'].capitalize()}** — ₨{top['amount']:,.0f} ({top['percentage']}%)\n\n**Full breakdown:**\n"
                for item in analysis['category_breakdown'][:5]:
                    response += f"• {item['category'].capitalize()}: ₨{item['amount']:,.0f} ({item['percentage']}%)\n"
            else:
                response = "No expense data available yet. Start adding your expenses!"

        elif any(w in q for w in ['next month', 'predict', 'future', 'forecast', 'expected']):
            response = f"🔮 **Next Month Expense Forecast**\n\nPredicted: **₨{predictions['prediction']:,.0f}** ({predictions['confidence'].upper()} confidence)\n\n"
            if predictions.get('monthly_predictions'):
                response += "**3-Month Outlook:**\n"
                for m in predictions['monthly_predictions']:
                    response += f"• {m['month']}: ₨{m['predicted']:,.0f}\n"

        elif any(w in q for w in ['overspend', 'over budget', 'exceed', 'too much']):
            response = "⚠️ **Overspending Analysis**\n\n"
            for alert in overspending['alerts'][:3]:
                response += f"• {alert}\n"

        elif any(w in q for w in ['income', 'earning', 'salary']):
            total = float(self.income_df['amount'].sum()) if not self.income_df.empty else 0
            response = f"💰 **Income Summary**\n\nTotal recorded income: ₨{total:,.0f}"

        elif any(w in q for w in ['score', 'health', 'grade', 'status']):
            hs = self.get_financial_health_score()
            response = f"🏆 **Your Financial Health Score: {hs['score']}/100 (Grade {hs['grade']} — {hs['label']})**\n\n"
            for b in hs['breakdown']:
                response += f"• {b['metric']}: {b['score']}/{b['max']} — {b['value']}\n"

        elif any(w in q for w in ['hello', 'hi', 'hey', 'help']):
            response = "👋 **Hello! I'm your AI Finance Assistant.**\n\nI can help you with:\n• 💰 How can I save more money?\n• 📊 Which category costs me the most?\n• 🔮 What's my expected spending next month?\n• ⚠️ Am I overspending anywhere?\n• 🏆 What is my financial health score?\n\nJust ask me anything!"

        else:
            response = "💬 **Financial Summary**\n\n"
            if analysis['insights']:
                for ins in analysis['insights'][:2]:
                    response += f"• {ins}\n"
            response += "\n**Recommendations:**\n"
            for rec in recommendations[:2]:
                response += f"• {rec}\n"

        return response
