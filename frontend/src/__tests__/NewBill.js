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
    // test the handleChangeFile function
    test("Then, the file is uploaded", () => {
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

      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      const file = screen.getByTestId("file");
      file.addEventListener("change", handleChangeFile);
      fireEvent.change(file);

      expect(handleChangeFile).toHaveBeenCalled();
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

  describe("When I am on NewBill Page but back-end send an error message", () => {
    test("Then, Error page should be rendered", () => {
      const html = NewBillUI({ error: "some error message" });
      document.body.innerHTML = html;
      expect(screen.getAllByText("Erreur")).toBeTruthy();
    });
  });
});
