import { screen } from "@testing-library/react";
import { AxiosError } from "axios";
import { healthService } from "@/common/api/health";
import { renderWithProviders } from "@/test/renderWithProviders";
import { ApiStatus } from "./ApiStatus";

vi.mock("@/common/api/health", () => ({
  healthService: { getHealth: vi.fn() },
}));

const getHealth = vi.mocked(healthService.getHealth);

describe("ApiStatus", () => {
  it("shows API and database as up", async () => {
    getHealth.mockResolvedValue({ details: { database: { status: "up" } } });

    renderWithProviders(<ApiStatus />);

    expect(await screen.findByText("database:")).toBeInTheDocument();
    expect(screen.getAllByText("up")).toHaveLength(2);
  });

  it("shows the database as down with its reason", async () => {
    getHealth.mockResolvedValue({
      details: { database: { status: "down", message: "Connection refused" } },
    });

    renderWithProviders(<ApiStatus />);

    expect(await screen.findByText("down")).toBeInTheDocument();
    expect(screen.getByText("— Connection refused")).toBeInTheDocument();
  });

  it("shows the API as down when the server is unreachable", async () => {
    getHealth.mockRejectedValue(new AxiosError("Network Error"));

    renderWithProviders(<ApiStatus />);

    expect(await screen.findByText("— No server connection")).toBeInTheDocument();
  });
});
