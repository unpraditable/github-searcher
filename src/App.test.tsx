import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "./App";

beforeEach(() => {
  jest.spyOn(global, "fetch").mockImplementation((url: any) => {
    if (url.includes("search/users")) {
      return Promise.resolve({
        json: () =>
          Promise.resolve({
            items: [
              { id: 1, login: "testuser", avatar_url: "avatar.png", html_url: "url" },
            ],
          }),
      } as any);
    }
    if (url.includes("users/testuser/repos")) {
      return Promise.resolve({
        json: () =>
          Promise.resolve([
            { id: 1, name: "repo1", html_url: "repo-url", description: "desc", stargazers_count: 5 },
          ]),
      } as any);
    }
    return Promise.reject("unknown url");
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

test("renders search input", () => {
  render(<App />);
  expect(screen.getByPlaceholderText(/search username/i)).toBeInTheDocument();
});

test("searches and displays user", async () => {
  render(<App />);
  fireEvent.change(screen.getByPlaceholderText(/search username/i), {
    target: { value: "test" },
  });

  await waitFor(() => screen.findByText("testuser"));
  expect(screen.getByText("testuser")).toBeInTheDocument();
});

test("displays repositories after selecting user", async () => {
  render(<App />);
  fireEvent.change(screen.getByPlaceholderText(/search username/i), {
    target: { value: "test" },
  });

  await waitFor(() => screen.findByText("testuser"));
  fireEvent.click(screen.getByText("testuser"));

  await waitFor(() => screen.findByText("repo1"));
  expect(screen.getByText("repo1")).toBeInTheDocument();
});
