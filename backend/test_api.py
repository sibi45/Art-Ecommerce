import urllib.request
import json

def test():
    # 1. Test Login as Customer
    req = urllib.request.Request(
        "http://127.0.0.1:8080/api/auth/login",
        data=json.dumps({"email": "customer@artweb.com", "password": "User@123"}).encode(),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        print("Customer login successful! User:", data["user"]["full_name"], "Role:", data["user"]["role"])
        token = data["access_token"]

    # 2. Test Login as Admin
    req_admin = urllib.request.Request(
        "http://127.0.0.1:8080/api/auth/login",
        data=json.dumps({"email": "admin@artweb.com", "password": "Admin@123"}).encode(),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req_admin) as resp:
        data_admin = json.loads(resp.read().decode())
        print("Admin login successful! User:", data_admin["user"]["full_name"], "Role:", data_admin["user"]["role"])
        admin_token = data_admin["access_token"]

    # 3. Test submitting an inquiry
    req_inq = urllib.request.Request(
        "http://127.0.0.1:8080/api/inquiries",
        data=json.dumps({
            "painting_id": 1,
            "customer_phone": "+1 (555) 987-6543",
            "shipping_address": "789 Art Avenue, Penthouse B, Seattle, WA",
            "preferred_contact": "whatsapp",
            "message": "Interested in shipping to Seattle with certificate of authenticity."
        }).encode(),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }
    )
    with urllib.request.urlopen(req_inq) as resp:
        inq_data = json.loads(resp.read().decode())
        print("Inquiry created successfully! Code:", inq_data["inquiry_code"], "Status:", inq_data["status"])

    # 4. Test Admin stats
    req_stats = urllib.request.Request(
        "http://127.0.0.1:8080/api/admin/stats",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    with urllib.request.urlopen(req_stats) as resp:
        stats = json.loads(resp.read().decode())
        print("Admin Stats:", json.dumps(stats, indent=2))

if __name__ == "__main__":
    test()
