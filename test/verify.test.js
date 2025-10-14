const http = require("http");
const fs = require("fs");
const puppeteer = require("puppeteer");

let server;
let browser;
let page;

beforeAll(async () => {
  server = http.createServer((req, res) => {
    fs.readFile(__dirname + "/.." + req.url, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end(JSON.stringify(err));
        return;
      }
      res.writeHead(200);
      res.end(data);
    });
  });

  server.listen(process.env.PORT || 3000);
});

afterAll(() => {
  server.close();
});

beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });
  page = await browser.newPage();
  await page.goto("http://localhost:3000/index.html");
});

afterEach(async () => {
  await browser.close();
});

describe("form", () => {
  it("should contain two radio buttons", async () => {
    const radioButtons = await page.$$('form > input[type="radio"]');
    expect(radioButtons.length).toBe(2);
  });

  it("should contain three checkboxes", async () => {
    const checkboxes = await page.$$('form > input[type="checkbox"]');
    expect(checkboxes.length).toBe(3);
  });

  it("should contain one text input", async () => {
    const textBoxes = await page.$$('form > input[type="text"]');
    expect(textBoxes.length).toBe(1);
  });

  it("should contain one submit button", async () => {
    const submitButtons = await page.$$('form > button[type="submit"]');
    expect(submitButtons.length).toBe(1);
  });
});

describe("radio buttons", () => {
  it("should have matching labels", async () => {
    const ids = await page.$$eval('form > input[type="radio"]', radioButtons => 
      radioButtons.map(radioButton => radioButton.getAttribute("id"))
    );

    expect(ids.length).toBe(2);

    for (const id of ids) {
      const labels = await page.$$(`form > label[for='${id}']`);
      expect(labels.length).toBe(1);
    }
  });

  it("should have at least one selected by default", async () => {
    const selected = await page.$$eval('form > input[type="radio"]', radioButtons => 
      radioButtons.filter(radioButton => radioButton.hasAttribute("checked")).length
    );

    expect(selected).toBeGreaterThan(0);
  });
});

describe("checkboxes", () => {
  it("should have matching labels", async () => {
    const ids = await page.$$eval('form > input[type="checkbox"]', checkboxes => 
      checkboxes.map(checkbox => checkbox.getAttribute("id"))
    );

    expect(ids.length).toBe(3);

    for (const id of ids) {
      const label = await page.$$(`form > label[for='${id}']`);
      expect(label.length).toBe(1);
    }
  });

  it("should have at least one checked by default", async () => {
    const selected = await page.$$eval('form > input[type="checkbox"]', checkboxes => 
      checkboxes.filter(checkbox => checkbox.hasAttribute("checked")).length
    );

    expect(selected).toBeGreaterThan(0);
  });
});

describe("text input", () => {
  it("should have a placeholder", async () => {
    const hasPlaceholder = await page.$$eval('form > input[type="text"]', textInputs => 
      textInputs[0].hasAttribute("placeholder")
    );

    expect(hasPlaceholder).toBe(true);
  });

  it("should be required", async () => {
    const isRequired = await page.$$eval('form > input[type="text"]', textInputs => 
      textInputs[0].hasAttribute("required")
    );

    expect(isRequired).toBe(true);
  });
});

