import requests

def test_api():
    base_url = "http://127.0.0.1:8000"
    
    # 1. Login as Member (user0@test.com / password123)
    print("Logging in as user0@test.com...")
    login_res = requests.post(f"{base_url}/auth/login", json={
        "correo": "user0@test.com",
        "password": "password123"
    })
    if login_res.status_code != 200:
        print(f"Failed login: {login_res.status_code} - {login_res.text}")
        return
        
    member_token = login_res.json()["access_token"]
    headers_member = {"Authorization": f"Bearer {member_token}"}
    
    # 2. Check /dashboard/stats as Member (should be 403)
    res_stats_member = requests.get(f"{base_url}/dashboard/stats", headers=headers_member)
    print(f"Member /dashboard/stats status: {res_stats_member.status_code}")
    print(f"Member /dashboard/stats response: {res_stats_member.json()}")
    
    # 3. Check /dashboard/personal-stats as Member (should be 200)
    res_personal_member = requests.get(f"{base_url}/dashboard/personal-stats", headers=headers_member)
    print(f"Member /dashboard/personal-stats status: {res_personal_member.status_code}")
    if res_personal_member.status_code == 200:
        personal_data = res_personal_member.json()
        print(f"Member personal_stats XP points: {personal_data.get('personal_stats', {}).get('puntos_xp')}")
    
    # 4. Check /logs/ as Member (should be 403)
    res_logs_member = requests.get(f"{base_url}/logs/", headers=headers_member)
    print(f"Member /logs/ status: {res_logs_member.status_code}")
    
    # 5. Login as Admin (admin@meh.com / password123)
    print("\nLogging in as admin@meh.com...")
    login_admin = requests.post(f"{base_url}/auth/login", json={
        "correo": "admin@meh.com",
        "password": "password123"
    })
    admin_token = login_admin.json()["access_token"]
    headers_admin = {"Authorization": f"Bearer {admin_token}"}
    
    # 6. Check /dashboard/stats as Admin (should be 200)
    res_stats_admin = requests.get(f"{base_url}/dashboard/stats", headers=headers_admin)
    print(f"Admin /dashboard/stats status: {res_stats_admin.status_code}")
    if res_stats_admin.status_code == 200:
        admin_data = res_stats_admin.json()
        print(f"Admin stats widgets count: {len(admin_data.get('widgets', []))}")
        print(f"Admin stats advanced metrics keys: {list(admin_data.get('advanced_metrics', {}).keys())}")
        
    # 7. Check /logs/ as Admin (should be 200)
    res_logs_admin = requests.get(f"{base_url}/logs/", headers=headers_admin)
    print(f"Admin /logs/ status: {res_logs_admin.status_code}")

if __name__ == "__main__":
    test_api()
