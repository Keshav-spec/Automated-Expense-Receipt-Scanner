import streamlit as st
import requests
import pandas as pd
import plotly.express as px

API_URL = "http://127.0.0.1:8000"

# PAGE CONFIG

st.set_page_config(
    page_title="Expense Scanner",
    page_icon="🧾",
    layout="wide"
)

# SESSION STATE

if "token" not in st.session_state:
    st.session_state.token = None

if "username" not in st.session_state:
    st.session_state.username = None


# API HELPERS

def get_headers():
    return {
        "Authorization": f"Bearer {st.session_state.token}"
    }


def login(username, password):

    try:

        response = requests.post(
            f"{API_URL}/auth/login",
            data={
                "username": username,
                "password": password
            }
        )

        if response.status_code == 200:
            return response.json()["access_token"]

    except Exception:
        pass

    return None


def register(username, email, password):

    try:

        response = requests.post(
            f"{API_URL}/auth/register",
            params={
                "username": username,
                "email": email,
                "password": password
            }
        )

        return response.status_code == 200

    except Exception:
        return False


def upload_receipt(image_file):

    try:

        response = requests.post(
            f"{API_URL}/receipts/upload",
            files={
                "file": (
                    image_file.name,
                    image_file,
                    image_file.type
                )
            },
            headers=get_headers()
        )

        if response.status_code == 200:
            return response.json()

    except Exception:
        pass

    return None


def get_all_expenses():

    try:

        response = requests.get(
            f"{API_URL}/receipts/",
            headers=get_headers()
        )

        if response.status_code == 200:
            return response.json()

    except Exception:
        pass

    return []


def get_summary():

    try:

        response = requests.get(
            f"{API_URL}/analytics/summary",
            headers=get_headers()
        )

        if response.status_code == 200:
            return response.json()

    except Exception:
        pass

    return {}


# LOGIN / REGISTER

if not st.session_state.token:

    st.title("🧾 Expense Receipt Scanner")

    tab1, tab2 = st.tabs([
        "Login",
        "Register"
    ])

    # ---------------- LOGIN ----------------

    with tab1:

        with st.form("login_form"):

            username = st.text_input(
                "Username"
            )

            password = st.text_input(
                "Password",
                type="password"
            )

            submitted = st.form_submit_button(
                "Login"
            )

            if submitted:

                token = login(
                    username,
                    password
                )

                if token:

                    st.session_state.token = token
                    st.session_state.username = username

                    st.success(
                        "Logged in successfully!"
                    )

                    st.rerun()

                else:

                    st.error(
                        "Invalid username or password."
                    )

    # ---------------- REGISTER ----------------

    with tab2:

        with st.form("register_form"):

            new_username = st.text_input(
                "Username"
            )

            new_email = st.text_input(
                "Email"
            )

            new_password = st.text_input(
                "Password",
                type="password"
            )

            submitted = st.form_submit_button(
                "Register"
            )

            if submitted:

                success = register(
                    new_username,
                    new_email,
                    new_password
                )

                if success:

                    st.success(
                        "Account created successfully. Please login."
                    )

                else:

                    st.error(
                        "Registration failed."
                    )

# MAIN APP

else:

    st.sidebar.title(
        f"Welcome, {st.session_state.username} 👋"
    )

    if st.sidebar.button("Logout"):

        st.session_state.token = None
        st.session_state.username = None

        st.rerun()

    page = st.sidebar.radio(
        "Navigation",
        [
            "Upload Receipt",
            "My Expenses",
            "Dashboard"
        ]
    )

    # ==================================================
    # UPLOAD PAGE
    # ==================================================

    if page == "Upload Receipt":

        st.title("📤 Upload Receipt")

        uploaded_file = st.file_uploader(
            "Choose receipt image",
            type=["jpg", "jpeg", "png"]
        )

        if uploaded_file:

            st.image(
                uploaded_file,
                caption="Uploaded Receipt",
                width=300
            )

            if st.button(
                "Extract & Save"
            ):

                with st.spinner(
                    "Scanning receipt..."
                ):

                    result = upload_receipt(
                        uploaded_file
                    )

                if result:

                    st.success(
                        "Receipt processed successfully!"
                    )

                    col1, col2, col3, col4 = st.columns(4)

                    col1.metric(
                        "Merchant",
                        result.get(
                            "merchant",
                            "Unknown"
                        )
                    )

                    amount = result.get(
                        "amount"
                    )

                    col2.metric(
                        "Amount",
                        f"₹{amount:.2f}"
                        if amount
                        else "Not Found"
                    )

                    col3.metric(
                        "Date",
                        result.get(
                            "date",
                            "Unknown"
                        )
                    )

                    col4.metric(
                        "Category",
                        result.get(
                            "category",
                            "Other"
                        )
                    )

                else:

                    st.error(
                        "Failed to process receipt."
                    )

    # ==================================================
    # MY EXPENSES PAGE
    # ==================================================

    elif page == "My Expenses":

        st.title("📋 My Expenses")

        expenses = get_all_expenses()

        if not expenses:

            st.info(
                "No expenses found."
            )

        else:

            df = pd.DataFrame(
                expenses
            )

            df = df[
                [
                    "id",
                    "date",
                    "merchant",
                    "amount",
                    "category"
                ]
            ]

            df.columns = [
                "ID",
                "Date",
                "Merchant",
                "Amount (₹)",
                "Category"
            ]

            categories = [
                "All"
            ] + sorted(
                df["Category"]
                .dropna()
                .unique()
                .tolist()
            )

            selected = st.selectbox(
                "Filter by Category",
                categories
            )

            if selected != "All":

                df = df[
                    df["Category"] == selected
                ]

            st.dataframe(
                df,
                use_container_width=True
            )

            total = (
                pd.to_numeric(
                    df["Amount (₹)"],
                    errors="coerce"
                )
                .fillna(0)
                .sum()
            )

            st.metric(
                "Total Shown",
                f"₹{total:.2f}"
            )

            csv = df.to_csv(
                index=False
            )

            st.download_button(
                "Download CSV",
                csv,
                "expenses.csv",
                "text/csv"
            )

    # ==================================================
    # DASHBOARD PAGE
    # ==================================================

    elif page == "Dashboard":

        st.title("📊 Spending Dashboard")

        expenses = get_all_expenses()

        summary = get_summary()

        if not expenses:

            st.info(
                "Upload receipts to see analytics."
            )

        else:

            df = pd.DataFrame(
                expenses
            )

            df["amount"] = pd.to_numeric(
                df["amount"],
                errors="coerce"
            )

            df = df.dropna(
                subset=["amount"]
            )

            # KPI CARDS

            total = summary.get(
                "total_expenses",
                0
            )

            count = summary.get(
                "expense_count",
                0
            )

            avg = (
                total / count
                if count > 0
                else 0
            )

            c1, c2, c3 = st.columns(3)

            c1.metric(
                "Total Spent",
                f"₹{total:.2f}"
            )

            c2.metric(
                "Receipts",
                count
            )

            c3.metric(
                "Average",
                f"₹{avg:.2f}"
            )

            st.divider()

            col_left, col_right = st.columns(2)

            # ---------------- PIE CHART ----------------

            with col_left:

                st.subheader(
                    "Spending by Category"
                )

                cat_data = summary.get(
                    "by_category",
                    {}
                )

                if cat_data:

                    fig = px.pie(
                        values=list(
                            cat_data.values()
                        ),
                        names=list(
                            cat_data.keys()
                        ),
                        hole=0.4
                    )

                    st.plotly_chart(
                        fig,
                        use_container_width=True
                    )

            # ---------------- MONTHLY BAR ----------------

            with col_right:

                st.subheader(
                    "Monthly Spending"
                )

                df["date"] = pd.to_datetime(
                    df["date"]
                )

                df["month"] = (
                    df["date"]
                    .dt.to_period("M")
                    .astype(str)
                )

                monthly = (
                    df.groupby("month")["amount"]
                    .sum()
                    .reset_index()
                )

                fig = px.bar(
                    monthly,
                    x="month",
                    y="amount",
                    labels={
                        "month": "Month",
                        "amount": "Amount (₹)"
                    }
                )

                st.plotly_chart(
                    fig,
                    use_container_width=True
                )

            # ---------------- CATEGORY TREND ----------------

            st.subheader(
                "Category Spending Trend"
            )

            trend = (
                df.groupby(
                    [
                        "month",
                        "category"
                    ]
                )["amount"]
                .sum()
                .reset_index()
            )

            fig = px.line(
                trend,
                x="month",
                y="amount",
                color="category",
                labels={
                    "month": "Month",
                    "amount": "Amount (₹)"
                }
            )

            st.plotly_chart(
                fig,
                use_container_width=True
            )
