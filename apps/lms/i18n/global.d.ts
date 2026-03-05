import type Messages from "../messages/en.json";

declare global {
  interface IntlMessages extends Messages {}
}

export {};
