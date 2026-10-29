"""Environment loading tests: server.py honours a local .env file.

Run from the project root:
    python -m unittest tests.test_env -v
"""
import os
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def _read(name):
    with open(os.path.join(ROOT, name), encoding="utf-8") as f:
        return f.read()


class DotenvWiringTest(unittest.TestCase):
    def test_dotenv_is_a_declared_dependency(self):
        self.assertIn("python-dotenv", _read("requirements.txt"))

    def test_server_loads_dotenv_before_reading_config(self):
        src = _read("server.py")
        self.assertIn("load_dotenv", src)
        # The .env file must load before META_API_KEY is read at import.
        self.assertLess(
            src.index("load_dotenv("),
            src.index('os.environ.get("META_API_KEY"'),
        )


if __name__ == "__main__":
    unittest.main()
