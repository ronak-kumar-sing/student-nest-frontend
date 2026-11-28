import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProfileEditForm } from "./profile-edit-form";
import { ApiError } from "@/lib/api/errors";
import type { UserMe } from "@/lib/api";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe("ProfileEditForm", () => {
  const mockStudentMe: UserMe = {
    id: "user-asha-1",
    role: "student",
    status: "active",
    email: "asha@example.com",
    emailVerified: true,
    phone: "+919876543210",
    phoneVerified: false,
    displayName: "Asha Verma",
    bio: "Final-year B.Tech student.",
    gender: "female",
    college: "IIPS Indore",
    city: "indore",
    notificationPrefs: {
      channels: { email: true, sms: false, push: false },
      types: {},
    },
    claims: {
      role: "student",
      phone_verified: false,
      kyc_status: "none",
    },
  } as unknown as UserMe;

  it("pre-fills fields and has associated labels", () => {
    const save = vi.fn().mockResolvedValue(mockStudentMe);

    renderWithClient(<ProfileEditForm me={mockStudentMe} save={save} />);

    expect(screen.getByLabelText("Name")).toHaveValue("Asha Verma");
    expect(screen.getByLabelText("Bio")).toHaveValue("Final-year B.Tech student.");
    expect(screen.getByLabelText("Gender")).toHaveValue("female");
    expect(screen.getByLabelText("College")).toHaveValue("IIPS Indore");
    expect(screen.getByLabelText("City")).toHaveValue("indore");
  });

  it('changing name to "A" and submitting shows error and does not call save', async () => {
    const user = userEvent.setup();
    const save = vi.fn().mockResolvedValue(mockStudentMe);

    renderWithClient(<ProfileEditForm me={mockStudentMe} save={save} />);

    const nameInput = screen.getByLabelText("Name");
    await user.clear(nameInput);
    await user.type(nameInput, "A");

    const submitBtn = screen.getByRole("button", { name: "Save changes" });
    await user.click(submitBtn);

    expect(
      screen.getByText("Enter your name (2 to 50 characters).")
    ).toBeInTheDocument();
    expect(save).not.toHaveBeenCalled();
  });

  it('changing name and college calls save with only changed fields and calls onSaved', async () => {
    const user = userEvent.setup();
    const updatedMe: UserMe = {
      ...mockStudentMe,
      displayName: "Asha V Verma",
      college: "DAVV Indore",
    };
    const save = vi.fn().mockResolvedValue(updatedMe);
    const onSaved = vi.fn();

    renderWithClient(
      <ProfileEditForm
        me={mockStudentMe}
        save={save}
        onSaved={onSaved}
      />
    );

    const nameInput = screen.getByLabelText("Name");
    const collegeInput = screen.getByLabelText("College");

    await user.clear(nameInput);
    await user.type(nameInput, "Asha V Verma");

    await user.clear(collegeInput);
    await user.type(collegeInput, "DAVV Indore");

    const submitBtn = screen.getByRole("button", { name: "Save changes" });
    await user.click(submitBtn);

    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith({
      displayName: "Asha V Verma",
      college: "DAVV Indore",
    });
    expect(onSaved).toHaveBeenCalledWith(updatedMe);
  });

  it("shows friendly error alert when save rejects with VALIDATION_FAILED", async () => {
    const user = userEvent.setup();
    const save = vi.fn().mockRejectedValue(
      new ApiError(400, "VALIDATION_FAILED", "Validation failed")
    );

    renderWithClient(<ProfileEditForm me={mockStudentMe} save={save} />);

    const nameInput = screen.getByLabelText("Name");
    await user.clear(nameInput);
    await user.type(nameInput, "Asha Updated");

    const submitBtn = screen.getByRole("button", { name: "Save changes" });
    await user.click(submitBtn);

    expect(save).toHaveBeenCalledTimes(1);
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      "Some details are not valid. Check the form and try again."
    );
  });
});
