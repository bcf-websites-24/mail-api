import concurrent.futures
import requests
import time
import dotenv
import os

dotenv.load_dotenv()

url = "https://api.mail.buetcsefest2024.com/otp"
headers = {
    "Authorization": f"Bearer {os.getenv('MAIL_API_KEY')}",
    "Content-Type": "application/json",
}

payload = {"name": "Ashrafur Rahman", "email": "ashrafurkhan37@gmail.com"}

success_count = 0
failure_count = 0

n = 30
workers = 5

t = n // workers


def send_otp_request(worker_id):
    global success_count, failure_count

    for i in range(t):
        try:
            response = requests.post(url, headers=headers, json=payload)

            if response.status_code == 200:
                success_count += 1
                print(f"Worker {worker_id}: Request {i+1}/{t} succeeded.")
            else:
                failure_count += 1
                print(
                    f"Worker {worker_id}: Request {i+1}/{t} failed with status code {response.status_code}."
                )

        except Exception as e:
            failure_count += 1
            print(f"Worker {worker_id}: Request {i+1}/{t} failed with error: {e}.")

        print(f"Total successful: {success_count}, Total failed: {failure_count}")

        time.sleep(5)


if __name__ == "__main__":
    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as executor:
        for worker_id in range(1, 4):
            executor.submit(send_otp_request, worker_id)
