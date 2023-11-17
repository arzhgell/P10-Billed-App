/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";

import { screen, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";
import store from "../__mocks__/store.js";

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );
  });

  describe("When I am on NewBill Page", () => {
    test("Then new bill icon in vertical layout should be highlighted", async () => {
      const root = document.createElement("div");

      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      const newBillIcon = screen.getByTestId("icon-mail");
      expect(newBillIcon).toHaveClass("active-icon");
    });

    test("Then display the form", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    });

    describe("When you want to check that the inputs are filled", () => {
      test("Expense type is filled", () => {
        const input = screen.getByTestId("expense-type");
        userEvent.selectOptions(input, "Fournitures de bureau");
        expect(input).toHaveValue("Fournitures de bureau");
      });

      test("Expense name is filled", () => {
        const input = screen.getByTestId("expense-name");
        userEvent.type(input, "Agrafeuse");
        expect(input).toHaveValue("Agrafeuse");
      });

      test("Expense amount is filled", () => {
        const input = screen.getByTestId("amount");
        userEvent.type(input, "230");
        expect(input).toHaveValue(230);
      });

      test("Expense vat is filled", () => {
        const input = screen.getByTestId("vat");
        userEvent.type(input, "20");
        expect(input).toHaveValue(20);
      });

      test("Expense pct is filled", () => {
        const input = screen.getByTestId("pct");
        userEvent.type(input, "20");
        expect(input).toHaveValue(20);
      });

      test("Expense comment is filled", () => {
        const input = screen.getByTestId("commentary");
        userEvent.type(input, "Achat d'une nouvelle agrafeuse pour le bureau");
        expect(input).toHaveValue(
          "Achat d'une nouvelle agrafeuse pour le bureau"
        );
      });
    });

    test("Then send the form and redirected to the bills page", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      document.body.innerHTML = NewBillUI();

      onNavigate(ROUTES_PATH.NewBill); // Redirection to make sure you are on the right page

      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage,
      });

      const handleSubmit = jest.fn(newBill.handleSubmit);
      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
    });

    test("Test adding a file to the handleChangeFile function", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      document.body.innerHTML = NewBillUI();

      onNavigate(ROUTES_PATH.NewBill);

      const input = screen.getByTestId("file");
      const file = new File(["Hello, world!"], "test.jpg", {
        type: "image/jpeg",
      });
      userEvent.upload(input, file);

      expect(input.files[0]).toStrictEqual(file);
    });

    test("Add new bill with mockStore / POST test", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      document.body.innerHTML = NewBillUI();

      onNavigate(ROUTES_PATH.NewBill);

      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage,
      });

      const handleSubmit = jest.fn(newBill.handleSubmit);
      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
    });
  });
});
