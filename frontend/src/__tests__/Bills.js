/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import "@testing-library/jest-dom/extend-expect";

import $ from "jquery";
import { screen } from "@testing-library/dom";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event";
import mockStore from "../__mocks__/store";
import Bills from "../containers/Bills.js";

import router from "../app/Router.js";
import Logout from "../containers/Logout.js";
import BillsUI from "../views/BillsUI.js";

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
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.append(root);
    router();
    window.onNavigate(ROUTES_PATH.Bills);
  });

  test("getBills return 4 bills", async () => {
    const html = BillsUI({ data: bills });
    document.body.innerHTML = html;
    const numberBills = await screen.findAllByTestId("bill");
    console.log(numberBills);
    expect(numberBills.length).toBe(4);
  });

  describe("When I am on Bills Page", () => {
    test("I click on the icon eye, then a modal should appear and the image is rendered", async () => {
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;

      const iconEyes = Array.from(
        document.querySelectorAll("[data-testid='icon-eye']")
      );

      $.fn.modal = jest.fn();
      const BillsConstructor = new Bills({
        document,
        onNavigate,
        firestore: null,
        localStorage: window.localStorage,
      });
      const handleClickIconEye = jest.fn(BillsConstructor.handleClickIconEye);
      if (iconEyes.length > 0) {
        iconEyes.forEach((iconEye) => {
          iconEye.addEventListener("click", () => handleClickIconEye(iconEye));
        });
        userEvent.click(iconEyes[0]);
        expect(handleClickIconEye).toHaveBeenCalled();
      } else {
        throw new Error("No elements with data-testid 'icon-eye' found");
      }
    });

    test("Then bills should be ordered from earliest to latest", () => {
      const sortedBills = bills.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      expect(sortedBills).toEqual(bills);
    });

    test("Then im redirect to new bill page when i click on Nouvelle note de frais", () => {
      const html = BillsUI({ data: [] });
      document.body.innerHTML = html;
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const firestore = null;
      const bills = new Bills({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      });
      const handleClickNewBill = jest.fn((e) => bills.handleClickNewBill(e));
      const btnNewBill = screen.getByTestId("btn-new-bill");
      btnNewBill.addEventListener("click", handleClickNewBill);
      userEvent.click(btnNewBill);
      expect(handleClickNewBill).toHaveBeenCalled();
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    });
  });

  describe("When I am on Bills Page but it is loading", () => {
    test("Then, Loading page should be rendered", () => {
      const html = BillsUI({ loading: true });
      document.body.innerHTML = html;
      expect(screen.getAllByText("Loading...")).toBeTruthy();
    });
  });

  describe("When I am on Bills Page but back-end send an error message", () => {
    test("Then, Error page should be rendered", () => {
      const html = BillsUI({ error: "Erreur" });
      document.body.innerHTML = html;
      expect(screen.getAllByText("Erreur")).toBeTruthy();
    });
  });
});
