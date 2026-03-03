import psycopg2
try:
    psycopg2.connect(host="localhost", database="base_que_no_existe", user="postgres", password="password_falsa")
except Exception as e:
    print(f"Error: {e}")
