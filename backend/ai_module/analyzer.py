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
    def _fmt(self, amount):
        return f"₨{amount:,.0f}"

    def chat_response(self, question):
        """Generate intelligent AI chat responses about user's finances"""
        q = question.lower()

        # Lazy-load all data once
        analysis      = self.get_spending_analysis()
        predictions   = self.predict_next_month_expenses()
        recommendations = self.generate_recommendations()
        overspending  = self.detect_overspending()
        health        = self.get_financial_health_score()
        savings_pred  = self.predict_savings()

        total_exp     = analysis.get('total_expenses', 0)
        monthly_inc   = analysis.get('monthly_income', 0)
        savings_rate  = analysis.get('savings_rate', 0)
        cat_breakdown = analysis.get('category_breakdown', [])

        # ── Greetings / help ──────────────────────────────────────────────
        if any(w in q for w in ['hello', 'hi', 'hey', 'help', 'kya kar', 'what can']):
            return (
                "👋 **Assalam o Alaikum! Main aapka AI Finance Assistant hoon.**\n\n"
                "Main aapki in chezon mein madad kar sakta hoon:\n\n"
                "💰 Paisa kaise bachayein?\n"
                "📊 Sabse zyada kahan kharcha ho raha hai?\n"
                "🔮 Agla mahina kitna kharcha hoga?\n"
                "⚠️ Kahan overspend ho raha hoon?\n"
                "🏆 Mera financial health score kya hai?\n"
                "📉 Kharcha kaise kam karein?\n"
                "🎯 Savings goal kaise poora karein?\n"
                "💳 Budget tips?\n\n"
                "Koi bhi sawal poochein — main aapki real data se jawab dunga! 🤖"
            )

        # ── How to save money ─────────────────────────────────────────────
        if any(w in q for w in ['save', 'saving', 'bachaon', 'bachao', 'paisa bacha', 'savings', 'kam karo', 'reduce', 'cut']):
            resp = "💡 **Paisa Bachane ke Tarike — Aapki Data ke Mutabiq:**\n\n"

            if monthly_inc > 0 and savings_rate < 20:
                needed = monthly_inc * 0.20 - max(monthly_inc - total_exp, 0)
                resp += f"📌 Abhi aap {savings_rate:.0f}% save kar rahe hain. 20% target ke liye {self._fmt(max(needed,0))} aur bachana hoga.\n\n"

            if recommendations:
                resp += "**Personalized Tips:**\n"
                for rec in recommendations:
                    resp += f"• {rec}\n"
            else:
                resp += (
                    "**General Tips:**\n"
                    "• 🍳 Ghar ka khana khayein — restaurant se 30-40% bachta hai\n"
                    "• 📱 Subscriptions review karein — koi unnecessary nahi?\n"
                    "• 🛍️ 24-ghante rule: Koi cheez khareedne se pehle ek din sochein\n"
                    "• ⚡ Bijli/paani ka bill kam karein — AC temperature 1-2 degree badhayein\n"
                    "• 🚌 Haftay mein 2-3 baar public transport use karein\n"
                )

            if savings_pred.get('predicted_savings', 0) > 0:
                resp += f"\n📈 **Predicted savings next month: {self._fmt(savings_pred['predicted_savings'])}**"
                if savings_pred.get('predictions'):
                    cum = savings_pred['predictions'][-1].get('cumulative_savings', 0) if len(savings_pred['predictions']) >= 6 else 0
                    if cum > 0:
                        resp += f"\n🎯 6 mahinon mein {self._fmt(cum)} jama ho sakta hai!"
            return resp

        # ── Highest / top spending category ──────────────────────────────
        if any(w in q for w in ['most', 'highest', 'sabse zyada', 'top', 'costs most', 'biggest', 'maximum', 'bari category', 'costly']):
            if cat_breakdown:
                top = cat_breakdown[0]
                resp = (
                    f"📊 **Sabse Badi Expense Category:**\n\n"
                    f"🥇 **{top['category'].capitalize()}** — {self._fmt(top['amount'])} "
                    f"({top['percentage']}% of total spending"
                )
                if monthly_inc > 0:
                    resp += f", {top['percentage_of_income']}% of income"
                resp += ")\n\n**Poora Breakdown:**\n"
                for i, item in enumerate(cat_breakdown[:6]):
                    bar = '█' * max(1, int(item['percentage'] / 5))
                    resp += f"{i+1}. {item['category'].capitalize()}: {self._fmt(item['amount'])} {bar} {item['percentage']}%\n"
                if top['percentage'] > 35:
                    resp += f"\n⚠️ {top['category'].capitalize()} pe bahut zyada kharcha hai — thoda kam karein!"
            else:
                resp = "Abhi koi expense data nahi hai. Pehle transactions add karein!"
            return resp

        # ── Forecast / predictions ────────────────────────────────────────
        if any(w in q for w in ['next month', 'predict', 'forecast', 'future', 'expected', 'agla', 'agle mahine', 'kitna hoga', 'aney wala']):
            resp = (
                f"🔮 **Aglay Mahine ka Expense Forecast:**\n\n"
                f"📍 Predicted: **{self._fmt(predictions['prediction'])}** "
                f"({predictions['confidence'].upper()} confidence)\n\n"
            )
            if predictions.get('monthly_predictions'):
                resp += "**3-Month Outlook:**\n"
                for m in predictions['monthly_predictions']:
                    resp += f"• {m['month']}: {self._fmt(m['predicted'])}\n"
            if monthly_inc > 0:
                next_saving = monthly_inc - predictions['prediction']
                resp += f"\n💰 Agar income same rahe ({self._fmt(monthly_inc)}), to next month savings: **{self._fmt(max(next_saving,0))}**"
            resp += f"\n\n📊 _{predictions.get('message', '')}_"
            return resp

        # ── Overspending ──────────────────────────────────────────────────
        if any(w in q for w in ['overspend', 'over budget', 'exceed', 'too much', 'zyada', 'badh gaya', 'limit', 'budget cross']):
            resp = "⚠️ **Overspending Analysis:**\n\n"
            alerts = overspending.get('alerts', [])
            if alerts and alerts[0] != '✅ Spending is stable compared to last month.':
                for alert in alerts[:4]:
                    resp += f"• {alert}\n"
            else:
                resp += "✅ Kharcha pichle mahine se stable hai — achha hai!\n"
            comparison = overspending.get('comparison', [])
            if comparison:
                resp += "\n**Month-on-Month Change:**\n"
                for c in comparison[:4]:
                    arrow = '📈' if c['change_percentage'] > 0 else '📉'
                    resp += f"• {c['category'].capitalize()}: {arrow} {abs(c['change_percentage']):.0f}% ({self._fmt(c['previous'])} → {self._fmt(c['current'])})\n"
            return resp

        # ── Income ────────────────────────────────────────────────────────
        if any(w in q for w in ['income', 'earning', 'salary', 'kamai', 'tawana', 'tankhwa', 'amdani']):
            if not self.income_df.empty:
                total_all = float(self.income_df['amount'].sum())
                from django.utils import timezone as tz
                now = tz.now()
                this_month = float(self.income_df[
                    (self.income_df['month'] == now.month) & (self.income_df['year'] == now.year)
                ]['amount'].sum())
                sources = self.income_df.groupby('source')['amount'].sum().sort_values(ascending=False)
                resp = (
                    f"💰 **Income Summary:**\n\n"
                    f"• Is mahine: **{self._fmt(this_month)}**\n"
                    f"• Total (all time): {self._fmt(total_all)}\n\n"
                    f"**Income Sources:**\n"
                )
                for src, amt in sources.head(5).items():
                    resp += f"• {str(src).capitalize()}: {self._fmt(float(amt))}\n"
                if this_month > 0 and total_exp > 0:
                    resp += f"\n📊 Is mahine {self._fmt(total_exp)} kharcha, {self._fmt(max(this_month - total_exp, 0))} bacha."
            else:
                resp = "💰 Koi income record nahi hai. Pehle income add karein!"
            return resp

        # ── Health score ──────────────────────────────────────────────────
        if any(w in q for w in ['score', 'health', 'grade', 'status', 'kitna acha', 'financial health', 'rating']):
            resp = (
                f"🏆 **Financial Health Score: {health['score']}/100 "
                f"(Grade {health['grade']} — {health['label']})**\n\n"
            )
            for b in health['breakdown']:
                icon = '✅' if b['status'] in ('good','excellent') else '⚠️' if b['status'] == 'warning' else '❌'
                resp += f"{icon} {b['metric']}: {b['score']}/{b['max']} — {b['value']}\n"
            resp += "\n**Score Improve karne ke Tips:**\n"
            for b in health['breakdown']:
                if b['status'] == 'bad':
                    resp += f"• {b['metric']} fix karein — abhi {b['score']}/{b['max']} hai\n"
                elif b['status'] == 'warning':
                    resp += f"• {b['metric']} thoda improve karein ({b['value']})\n"
            if not any(b['status'] in ('bad','warning') for b in health['breakdown']):
                resp += "• Bohat acha! Sab metrics theek hain 🎉\n"
            return resp

        # ── Budget tips ───────────────────────────────────────────────────
        if any(w in q for w in ['budget', 'plan', 'manage', 'handle', 'tips', 'advice', 'rule', 'formula']):
            resp = "📋 **Budget Tips — Aapke Liye Personalized:**\n\n"
            if monthly_inc > 0:
                resp += (
                    f"**50/30/20 Rule ({self._fmt(monthly_inc)} income ke liye):**\n"
                    f"• 🏠 Zaroorat (50%): {self._fmt(monthly_inc * 0.50)} — rent, khana, transport\n"
                    f"• 🎉 Chahaton (30%): {self._fmt(monthly_inc * 0.30)} — entertainment, shopping\n"
                    f"• 💰 Savings (20%): {self._fmt(monthly_inc * 0.20)} — emergency fund, invest\n\n"
                )
                if total_exp > 0:
                    resp += f"**Abhi ka haal:** {self._fmt(total_exp)} kharcha ({savings_rate:.0f}% savings rate)\n\n"
            resp += (
                "**Practical Budget Hacks:**\n"
                "• 💵 Mahine ki shuruat mein hi savings alag kar lein (pay yourself first)\n"
                "• 📝 Weekly expense review karein — sirf 5 minute\n"
                "• 🏦 Emergency fund: kam az kam 3 mahine ka kharcha\n"
                "• 📱 Apps use karein (jaise yeh!) — tracking se 15-20% kharcha automatic kam hota hai\n"
                "• 🛒 Grocery list bana ke jayein — impulse buying se bachein\n"
            )
            return resp

        # ── Specific category queries ─────────────────────────────────────
        for cat_kw, cat_key in [
            (['food', 'khana', 'restaurant', 'groceries'], 'food'),
            (['transport', 'petrol', 'fuel', 'car', 'ride', 'safar'], 'transport'),
            (['entertainment', 'cinema', 'movies', 'tafrih'], 'entertainment'),
            (['shopping', 'clothes', 'khareedari'], 'shopping'),
            (['utilities', 'bijli', 'paani', 'gas', 'bill'], 'utilities'),
            (['health', 'medical', 'doctor', 'medicine'], 'health'),
            (['education', 'school', 'tuition', 'books'], 'education'),
        ]:
            if any(w in q for w in cat_kw):
                cat_data = next((c for c in cat_breakdown if c['category'] == cat_key), None)
                if cat_data:
                    resp = (
                        f"📊 **{cat_key.capitalize()} Expenses:**\n\n"
                        f"• Is mahine: **{self._fmt(cat_data['amount'])}**\n"
                        f"• Total kharche ka: {cat_data['percentage']}%\n"
                    )
                    if monthly_inc > 0:
                        resp += f"• Income ka: {cat_data['percentage_of_income']}%\n"
                    # Category-specific tips
                    tips = {
                        'food': ["Ghar pe khana pakayein — 40% tak bachta hai", "Grocery list bana ke jayein", "Weekly meal prep karein"],
                        'transport': ["Carpooling try karein", "Public transport haftay mein 2-3 baar", "Qareeb ki jagah paidal jayein"],
                        'entertainment': ["Streaming services cinema se sasti hain", "Free events aur parks explore karein", "Friends ke sath ghar pe time spend karein"],
                        'shopping': ["24-hour rule — pehle sochein", "Discount/sale ka intezaar karein", "Zaroorat vs chahat ka farq samjhein"],
                        'utilities': ["AC 24-25°C pe rakhen", "LED bulbs use karein", "Paani waste na karein"],
                        'health': ["Preventive checkup regular rakhein", "Exercise se doctor visits kam hote hain", "Health insurance lo"],
                        'education': ["Online courses sasti hain", "Library resources free hain", "Group study se kitabein share karein"],
                    }
                    if cat_key in tips:
                        resp += f"\n**{cat_key.capitalize()} Kharcha Kam Karne ke Tips:**\n"
                        for tip in tips[cat_key]:
                            resp += f"• {tip}\n"
                else:
                    resp = f"📊 Is mahine {cat_key} category mein koi expense record nahi hai."
                return resp

        # ── Savings goals ─────────────────────────────────────────────────
        if any(w in q for w in ['goal', 'target', 'manzil', 'dream', 'khwab', 'kab tak', 'kitne din']):
            resp = "🎯 **Savings Goals ke liye Plan:**\n\n"
            if savings_pred.get('predictions'):
                resp += "**Projected Monthly Savings:**\n"
                for p in savings_pred['predictions'][:4]:
                    resp += f"• {p['month']}: {self._fmt(p['predicted_savings'])} (cumulative: {self._fmt(p['cumulative_savings'])})\n"
                resp += (
                    "\n**Common Goals Planning:**\n"
                    f"• 📱 Phone (₨80,000): {max(1, int(80000 / max(savings_pred['predicted_savings'],1)))} mahine\n"
                    f"• 🏍️ Bike (₨200,000): {max(1, int(200000 / max(savings_pred['predicted_savings'],1)))} mahine\n"
                    f"• ✈️ Trip (₨50,000): {max(1, int(50000 / max(savings_pred['predicted_savings'],1)))} mahine\n"
                    f"• 🏠 Down Payment (₨500,000): {max(1, int(500000 / max(savings_pred['predicted_savings'],1)))} mahine\n"
                )
            else:
                resp += "Income aur expenses add karein taake main aapke goals calculate kar sakun!"
            return resp

        # ── Current month summary ─────────────────────────────────────────
        if any(w in q for w in ['summary', 'total', 'is mahine', 'this month', 'current', 'abhi', 'overall', 'kitna kharcha']):
            resp = "📋 **Is Mahine ki Financial Summary:**\n\n"
            resp += f"• 💵 Income: {self._fmt(monthly_inc)}\n"
            resp += f"• 💸 Total Expenses: {self._fmt(total_exp)}\n"
            resp += f"• 💰 Net Savings: {self._fmt(max(monthly_inc - total_exp, 0))}\n"
            resp += f"• 📊 Savings Rate: {savings_rate:.0f}%\n"
            resp += f"• 🏆 Health Score: {health['score']}/100 ({health['grade']})\n"
            if cat_breakdown:
                resp += f"\n**Top Categories:**\n"
                for c in cat_breakdown[:3]:
                    resp += f"• {c['category'].capitalize()}: {self._fmt(c['amount'])} ({c['percentage']}%)\n"
            if analysis.get('insights'):
                resp += f"\n**AI Insights:**\n"
                for ins in analysis['insights'][:2]:
                    resp += f"• {ins}\n"
            return resp

        # ── Invest / mutual funds / growth ────────────────────────────────
        if any(w in q for w in ['invest', 'mutual fund', 'stocks', 'profit', 'grow', 'multiply', 'return']):
            saved = max(monthly_inc - total_exp, 0)
            resp = "📈 **Investment Advice — Pakistan ke Context Mein:**\n\n"
            if saved > 0:
                resp += f"Aap is mahine {self._fmt(saved)} bacha rahe hain. Iska ek hissa invest karein:\n\n"
            resp += (
                "**Beginners ke liye Options:**\n"
                "• 🏦 **National Savings** — Government-backed, 15-20% annual return, risk-free\n"
                "• 📊 **Mutual Funds** (Meezan, UBL, MCB) — 12-18% average return, start from ₨5,000\n"
                "• 💰 **Defense Savings Certificates** — 3-10 saal, guaranteed return\n"
                "• 📱 **Roshan Digital Account** — NRPs ke liye, online kholein\n\n"
                "**Golden Rule:**\n"
                "• Pehle emergency fund (3 mahine ka kharcha)\n"
                "• Phir high-interest debt clear karein\n"
                "• Phir invest karein — 10-15% income se shuru karein\n"
            )
            return resp

        # ── Default: full financial summary ──────────────────────────────
        resp = "💬 **Aapki Financial Overview:**\n\n"
        if monthly_inc > 0:
            resp += f"📊 Income: {self._fmt(monthly_inc)} | Expenses: {self._fmt(total_exp)} | Savings: {savings_rate:.0f}%\n\n"
        if analysis.get('insights'):
            resp += "**AI Insights:**\n"
            for ins in analysis['insights'][:3]:
                resp += f"• {ins}\n"
        if recommendations:
            resp += "\n**Top Recommendations:**\n"
            for rec in recommendations[:3]:
                resp += f"• {rec}\n"
        resp += "\n💬 _Koi specific sawal poochein jaise: 'paisa kaise bachayein', 'health score', 'budget tips', ya 'investment advice'_"
        return resp
