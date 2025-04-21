import pytest
from httpx import AsyncClient
from backend.fastapi_app import app # アプリケーションインスタンスをインポート

@pytest.mark.asyncio
async def test_create_entry():
    async with AsyncClient(app=app, base_url="http://test") as client:
        test_content = "This is a test entry."
        response = await client.post("/entries", json={"content": test_content})

        # ステータスコードが200であることを確認
        assert response.status_code == 200

        # レスポンスボディに必要なキーが含まれていることを確認
        response_data = response.json()
        assert "id" in response_data
        # assert "message" in response_data # 必要に応じてメッセージも確認

        # (オプション) 返されたIDが期待される型（例: 整数）であることを確認
        assert isinstance(response_data["id"], int)

        # print(f"Test Response: {response_data}") # デバッグ用 