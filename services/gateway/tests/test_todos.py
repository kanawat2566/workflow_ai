import pytest
from fastapi.testclient import TestClient

from app.main import app, _todos

client = TestClient(app)


@pytest.fixture(autouse=True)
def clear_todos():
    _todos.clear()
    yield
    _todos.clear()


def test_create_todo():
    r = client.post("/todos", json={"title": "Buy milk"})
    assert r.status_code == 201
    data = r.json()
    assert data["title"] == "Buy milk"
    assert data["completed"] is False
    assert "id" in data


def test_create_todo_with_description():
    r = client.post("/todos", json={"title": "Buy milk", "description": "2 liters"})
    assert r.status_code == 201
    data = r.json()
    assert data["description"] == "2 liters"


def test_list_todos_empty():
    r = client.get("/todos")
    assert r.status_code == 200
    assert r.json() == []


def test_list_todos_returns_created_items():
    client.post("/todos", json={"title": "Task A"})
    client.post("/todos", json={"title": "Task B"})
    r = client.get("/todos")
    assert r.status_code == 200
    titles = [item["title"] for item in r.json()]
    assert "Task A" in titles
    assert "Task B" in titles


def test_get_todo_by_id():
    created = client.post("/todos", json={"title": "Read book"}).json()
    todo_id = created["id"]
    r = client.get(f"/todos/{todo_id}")
    assert r.status_code == 200
    assert r.json()["id"] == todo_id


def test_get_todo_not_found():
    r = client.get("/todos/nonexistent-id")
    assert r.status_code == 404


def test_update_todo_title():
    created = client.post("/todos", json={"title": "Old title"}).json()
    todo_id = created["id"]
    r = client.put(f"/todos/{todo_id}", json={"title": "New title"})
    assert r.status_code == 200
    assert r.json()["title"] == "New title"


def test_update_todo_completed():
    created = client.post("/todos", json={"title": "Do laundry"}).json()
    todo_id = created["id"]
    r = client.put(f"/todos/{todo_id}", json={"completed": True})
    assert r.status_code == 200
    assert r.json()["completed"] is True


def test_update_todo_not_found():
    r = client.put("/todos/nonexistent-id", json={"title": "Nope"})
    assert r.status_code == 404


def test_delete_todo():
    created = client.post("/todos", json={"title": "Delete me"}).json()
    todo_id = created["id"]
    r = client.delete(f"/todos/{todo_id}")
    assert r.status_code == 204
    r2 = client.get(f"/todos/{todo_id}")
    assert r2.status_code == 404


def test_delete_todo_not_found():
    r = client.delete("/todos/nonexistent-id")
    assert r.status_code == 404
