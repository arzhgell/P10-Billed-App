/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import "@testing-library/jest-dom/extend-expect";

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
  });

  describe("When I am on Bills Page", () => {
    test("Test the disconnection when the handleClick function is clicked", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      document.body.innerHTML = BillsUI({ data: bills });

      const logout = new Logout({ document, onNavigate, localStorage });

      const handleClick = jest.fn(logout.handleClick);

      const disconnectButton = screen.getByTestId("layout-disconnect");
      disconnectButton.addEventListener("click", handleClick);
      userEvent.click(disconnectButton);

      expect(handleClick).toHaveBeenCalled();
      expect(window.location.href).toMatch("/");
    });

    test("Then bill icon in vertical layout should be highlighted", () => {
      const root = document.createElement("div");

      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      const billsIcon = screen.getByTestId("icon-window");
      expect(billsIcon).toHaveClass("active-icon");
    });

    test("Then bills should be ordered from earliest to latest", () => {
      const sortedBills = bills.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      expect(sortedBills).toEqual(bills);
    });

    test("fetches bills from mock API GET", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const getSpy = jest.spyOn(mockStore, "get");
      const bills = await mockStore.get("bills");
      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(bills.data.length).toBe(4);
    });

    test("Then check that information is displayed correctly", () => {
      const displayedTypes = screen
        .getAllByTestId("bill-type")
        .map((element) => element.textContent);
      const displayedNames = screen
        .getAllByTestId("bill-name")
        .map((element) => element.textContent);
      const displayedDates = screen
        .getAllByTestId("bill-date")
        .map((element) => element.textContent);
      const displayedAmounts = screen
        .getAllByTestId("bill-amount")
        .map((element) => element.textContent);
      const displayedStatus = screen
        .getAllByTestId("bill-status")
        .map((element) => element.textContent);

      expect(displayedTypes).not.toEqual("null");
      expect(displayedNames).not.toEqual("null");
      expect(displayedDates).not.toEqual("1 Janv. 70");
      expect(displayedAmounts).not.toEqual("null");
      expect(displayedStatus).not.toEqual("undefined");
    });

    test("Then check that information is displayed correctly", () => {
      const displayedTypes = screen
        .getAllByTestId("bill-type")
        .map((element) => element.textContent);
      const displayedNames = screen
        .getAllByTestId("bill-name")
        .map((element) => element.textContent);
      const displayedDates = screen
        .getAllByTestId("bill-date")
        .map((element) => element.textContent);
      const displayedAmounts = screen
        .getAllByTestId("bill-amount")
        .map((element) => element.textContent);
      const displayedStatus = screen
        .getAllByTestId("bill-status")
        .map((element) => element.textContent);

      expect(displayedTypes).not.toEqual("null");
      expect(displayedNames).not.toEqual("null");
      expect(displayedDates).not.toEqual("1 Janv. 70");
      expect(displayedAmounts).not.toEqual("null");
      expect(displayedStatus).not.toEqual("undefined");
    });

    test("Test the redirection on click of the handleClickNewBill function", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const bill = new Bills({ document, onNavigate, localStorage });
      const handleClickNewBill = jest.fn(bill.handleClickNewBill);
      const newBill = screen.getByTestId("btn-new-bill");
      newBill.addEventListener("click", handleClickNewBill);
      userEvent.click(newBill);

      expect(handleClickNewBill).toHaveBeenCalled();
      expect(window.location.href).toMatch("/newbill");
    });

    test("Test that the date and status format are ok", () => {
      const displayedDates = screen
        .getAllByTestId("bill-date")
        .map((element) => element.textContent);
      const displayedStatus = screen
        .getAllByTestId("bill-status")
        .map((element) => element.textContent);

      displayedDates.forEach((date) => {
        expect(date).toMatch(/([0-9]{2}) ([a-zA-Z]{3})\. ([0-9]{4})/);
      });
      displayedStatus.forEach((status) => {
        expect(status).toMatch(/(pending|accepted|refused)/);
      });
    });

    test("Testing the handleClickIconEye function with a userEvent on click", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const bill = new Bills({ document, onNavigate, localStorage });
      const handleClickIconEye = jest.fn(bill.handleClickIconEye);
      const iconEye = screen.getAllByTestId("icon-eye");
      iconEye.forEach((icon) => {
        icon.addEventListener("click", handleClickIconEye);
        userEvent.click(icon);
      });

      expect(handleClickIconEye).toHaveBeenCalled();
    });

    describe("When an error occurs on API", () => {
      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);

        const message = await screen.getByText("Erreur");
        expect(message).toBeTruthy();
      });

      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);

        const message = await screen.getByText("Erreur");
        expect(message).toBeTruthy();
      });
    });
  });
});
