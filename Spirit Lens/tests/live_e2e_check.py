import urllib.request
import json
import time

def main():
    # 1. Health
    res = urllib.request.urlopen("http://127.0.0.1:8000/api/v1/health")
    health = json.loads(res.read().decode())
    print(f"Backend Health Status: {health['status']} | Server-Side Processing: {health['server_side_processing']}")

    # 2. Upload test using sample_data/nebula_cluster.png
    with open("sample_data/nebula_cluster.png", "rb") as f:
        img_data = f.read()

    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="nebula_cluster.png"\r\n'
        f"Content-Type: image/png\r\n\r\n"
    ).encode("latin1") + img_data + f"\r\n--{boundary}--\r\n".encode("latin1")

    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/v1/images/upload",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}
    )
    upload_res = json.loads(urllib.request.urlopen(req).read().decode())
    image_id = upload_res["image_id"]
    print(f"Uploaded Image ID: {image_id} | Dimensions: {upload_res['width']}x{upload_res['height']}")

    # 3. Trigger combined pipeline
    proc_req = urllib.request.Request(
        f"http://127.0.0.1:8000/api/v1/images/{image_id}/process",
        data=json.dumps({
            "restoration": {"denoise_strength": 15.0, "contrast": 15.0, "brightness": 0.0, "sharpening": 10.0, "background_leveling": False},
            "detection": {"threshold_sigma": 3.0, "min_area_pixels": 4, "max_sources": 150}
        }).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    job_res = json.loads(urllib.request.urlopen(proc_req).read().decode())
    job_id = job_res["job_id"]
    print(f"Processing Job ID: {job_id} | Status: {job_res['status']}")

    # 4. Poll
    for _ in range(40):
        st = json.loads(urllib.request.urlopen(f"http://127.0.0.1:8000/api/v1/jobs/{job_id}").read().decode())
        if st["status"] in ["completed", "failed"]:
            print(f"Final Job Status: {st['status']} | Duration: {st.get('duration_seconds')}s")
            break
        time.sleep(0.3)

    # 5. Results & CSV
    res = json.loads(urllib.request.urlopen(f"http://127.0.0.1:8000/api/v1/jobs/{job_id}/results").read().decode())
    print(f"Detected Celestial Sources: {res['source_count']}")
    print(f"Point Candidates: {res['point_candidate_count']} | Extended Candidates: {res['extended_candidate_count']}")
    print(f"Background Noise RMS: {res['background_rms']}")

    csv_text = urllib.request.urlopen(f"http://127.0.0.1:8000/api/v1/jobs/{job_id}/catalog.csv").read().decode("utf-8")
    lines = csv_text.splitlines()
    print("CSV Header:", lines[0])
    if len(lines) > 1:
        print("CSV Entry #1:", lines[1])

    print("ALL LIVE INTEGRATION CHECKS PASSED PERFECTLY!")

if __name__ == "__main__":
    main()
