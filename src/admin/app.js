import AuthLogo from "./extensions/logo.png";
import MenuLogo from "./extensions/logo.png";
import Favicon from "./extensions/logo.png";

const config = {
  auth: {
    logo: AuthLogo,
  },
  menu: {
    logo: MenuLogo,
  },
  head: {
    favicon: Favicon,
  },
  locales: [],
};

const bootstrap = (app) => {};

export default {
  config,
  bootstrap,
};