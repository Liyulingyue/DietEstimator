"""
简单的测试脚本，用于验证API是否正常工作
"""

import requests
import os

def test_health_check():
    """测试健康检查接口"""
    try:
        response = requests.get("http://localhost:8000/health")
        print(f"Health check status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_methods_endpoint():
    """测试获取方法列表接口"""
    try:
        response = requests.get("http://localhost:8000/api/v1/methods")
        print(f"Methods endpoint status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Methods endpoint failed: {e}")
        return False

def test_estimate_with_sample_image():
    """测试估算接口（需要提供图片和API密钥）"""
    # 这里需要实际的图片文件和API密钥
    # image_path = "sample_food.jpg"  # 替换为实际图片路径
    # api_key = "your_api_key_here"   # 替换为实际API密钥
    
    print("Note: 要测试估算接口，请提供实际的图片文件和API密钥")
    print("示例代码:")
    print("""
    files = {'files': open('food_image.jpg', 'rb')}
    data = {
        'api_key': 'your_api_key_here',
        'method': 'pure_llm'
    }
    response = requests.post('http://localhost:8000/api/v1/estimate', files=files, data=data)
    print(response.json())
    """)

if __name__ == "__main__":
    print("=== Testing Diet Estimator FastAPI ===")
    
    print("\n1. Testing health check...")
    health_ok = test_health_check()
    
    print("\n2. Testing methods endpoint...")
    methods_ok = test_methods_endpoint()
    
    print("\n3. Testing estimate endpoint...")
    test_estimate_with_sample_image()
    
    print(f"\n=== Test Results ===")
    print(f"Health check: {'✅ PASS' if health_ok else '❌ FAIL'}")
    print(f"Methods endpoint: {'✅ PASS' if methods_ok else '❌ FAIL'}")
    print(f"Note: Estimate endpoint requires actual image and API key to test")
    
    if health_ok and methods_ok:
        print("\n🎉 Basic API endpoints are working!")
    else:
        print("\n⚠️ Some endpoints are not working. Please check if the server is running.")
