"""
Pine Script Parser
Converts Pine Script v5 strategies to Python for backtesting.
"""

import re
from typing import Dict, List, Any, Optional
from dataclasses import dataclass

@dataclass
class PineScriptFunction:
    name: str
    args: List[str]
    body: str

@dataclass
class PineScriptStrategy:
    name: str
    inputs: Dict[str, Any]
    entries: List[Dict]  # long/short entry conditions
    exits: List[Dict]    # long/short exit conditions

class PineScriptParser:
    """Parse Pine Script v5 and convert to executable Python"""
    
    def __init__(self, code: str):
        self.code = code
        self.strategy = None
        self.indicators = {}
        self.variables = {}
        
    def parse(self) -> PineScriptStrategy:
        """Main parsing entry point"""
        # Extract strategy name
        name_match = re.search(r'strategy\s*\(\s*["\']([^"\']+)["\']', self.code)
        strategy_name = name_match.group(1) if name_match else "UnnamedStrategy"
        
        # Extract inputs (input functions)
        inputs = self._parse_inputs()
        
        # Extract indicators (built-in functions like sma, ema, rsi, etc.)
        self._parse_indicators()
        
        # Extract entry conditions
        entries = self._parse_conditions('entry')
        
        # Extract exit conditions  
        exits = self._parse_conditions('exit')
        
        self.strategy = PineScriptStrategy(
            name=strategy_name,
            inputs=inputs,
            entries=entries,
            exits=exits
        )
        
        return self.strategy
    
    def _parse_inputs(self) -> Dict[str, Any]:
        """Parse strategy.input() calls"""
        inputs = {}
        
        # Match input() calls
        input_pattern = r'(?:strategy\.)?input\s*\(\s*(?:default\s*=\s*)?(\d+(?:\.\d+)?|"[^"]*"|true|false)'
        for match in re.finditer(input_pattern, self.code):
            # This is simplified - full parser would track variable names
            pass
        
        # Look for common input patterns
        length_patterns = [
            r'(\w+)\s*=\s*input\s*\(\s*(\d+)',
            r'input\s*\(\s*(\d+)\s*,\s*["\']\s*(\w+)["\']',
        ]
        
        for pattern in length_patterns:
            for match in re.finditer(pattern, self.code):
                groups = match.groups()
                if len(groups) >= 2:
                    if groups[1].isdigit():
                        inputs[groups[0]] = int(groups[1])
                    else:
                        inputs[groups[0]] = groups[1]
        
        return inputs
    
    def _parse_indicators(self):
        """Parse indicator calculations (sma, ema, rsi, etc.)"""
        indicator_funcs = ['sma', 'ema', 'rma', 'wma', 'vwma', 'rsi', 'macd', 'bb', 'atr', 'stoch']
        
        for ind in indicator_funcs:
            # Pattern: name = sma(close, length)
            pattern = rf'(\w+)\s*=\s*{ind}\s*\([^)]+\)'
            for match in re.finditer(pattern, self.code):
                self.indicators[match.group(1)] = ind
    
    def _parse_conditions(self, condition_type: str) -> List[Dict]:
        """Parse strategy.entry() and strategy.exit() calls"""
        conditions = []
        
        if condition_type == 'entry':
            pattern = r'strategy\.entry\s*\(\s*["\']([^"\']+)["\']\s*,\s*(?:strategy\.)?(long|short|[^,\s]+)\s*,\s*(?:when\s*=\s*)?(.+?)(?:\s*[,\)]|$)'
        else:
            pattern = r'strategy\.exit\s*\(\s*["\']([^"\']+)["\']\s*,\s*(?:when\s*=\s*)?(.+?)(?:\s*[,\)]|$)'
        
        for match in re.finditer(pattern, self.code, re.DOTALL):
            groups = match.groups()
            if len(groups) >= 2:
                conditions.append({
                    'id': groups[0],
                    'direction': groups[1] if condition_type == 'entry' else None,
                    'condition': groups[-1].strip()
                })
        
        return conditions
    
    def to_python(self) -> str:
        """Convert parsed strategy to Python code"""
        if not self.strategy:
            self.parse()
        
        lines = [
            "# Auto-generated Python from Pine Script",
            "import pandas as pd",
            "import numpy as np",
            "",
            f"def run_strategy(df: pd.DataFrame, params: dict) -> dict:",
            f'    """Strategy: {self.strategy.name}"""',
            "",
            "    # Indicators",
        ]
        
        # Add indicator calculations
        for var_name, ind_type in self.indicators.items():
            if ind_type == 'sma':
                lines.append(f"    df['{var_name}'] = df['close'].rolling(window=params.get('{var_name}_len', 14)).mean()")
            elif ind_type == 'ema':
                lines.append(f"    df['{var_name}'] = df['close'].ewm(span=params.get('{var_name}_len', 14), adjust=False).mean()")
            elif ind_type == 'rsi':
                lines.append(f"    delta = df['close'].diff()")
                lines.append(f"    gain = delta.where(delta > 0, 0)")
                lines.append(f"    loss = -delta.where(delta < 0, 0)")
                lines.append(f"    avg_gain = gain.rolling(window=params.get('{var_name}_len', 14)).mean()")
                lines.append(f"    avg_loss = loss.rolling(window=params.get('{var_name}_len', 14)).mean()")
                lines.append(f"    rs = avg_gain / avg_loss")
                lines.append(f"    df['{var_name}'] = 100 - (100 / (1 + rs))")
        
        lines.extend([
            "",
            "    # Generate signals",
            "    df['signal'] = 0",
        ])
        
        # Add entry conditions
        for entry in self.strategy.entries:
            cond = self._convert_condition(entry['condition'])
            direction = entry.get('direction', 'long')
            if direction in ['long', 'strategy.long']:
                lines.append(f"    df.loc[{cond}, 'signal'] = 1")
            else:
                lines.append(f"    df.loc[{cond}, 'signal'] = -1")
        
        lines.extend([
            "",
            "    # Backtest simulation",
            "    return backtest(df)",
        ])
        
        return "\n".join(lines)
    
    def _convert_condition(self, condition: str) -> str:
        """Convert Pine Script condition to pandas-compatible Python"""
        # Simple conversions - full version would be more comprehensive
        
        # Replace Pine operators with Python
        cond = condition.replace(' and ', ' & ').replace(' or ', ' | ')
        cond = cond.replace('==', '==').replace('!=', '!=')
        cond = cond.replace('>=', '>=').replace('<=', '<=')
        
        # Handle crossover/crossunder
        cond = re.sub(r'crossover\s*\(([^,]+),\s*([^)]+)\)', r'(\1.shift(1) < \2) & (\1 >= \2)', cond, flags=re.IGNORECASE)
        cond = re.sub(r'crossunder\s*\(([^,]+),\s*([^)]+)\)', r'(\1.shift(1) > \2) & (\1 <= \2)', cond, flags=re.IGNORECASE)
        
        return cond


def parse_pine_script(code: str) -> PineScriptStrategy:
    """Convenience function to parse Pine Script"""
    parser = PineScriptParser(code)
    return parser.parse()

def pine_script_to_python(code: str) -> str:
    """Convenience function to convert Pine Script to Python"""
    parser = PineScriptParser(code)
    return parser.to_python()


if __name__ == "__main__":
    # Test with sample Pine Script
    sample = """
    strategy("SMA Crossover", overlay=true)
    
    fastLength = input(10)
    slowLength = input(30)
    
    fastSMA = ta.sma(close, fastLength)
    slowSMA = ta.sma(close, slowLength)
    
    if (ta.crossover(fastSMA, slowSMA))
        strategy.entry("Long", strategy.long)
    
    if (ta.crossunder(fastSMA, slowSMA))
        strategy.exit("ExitLong", "Long")
    """
    
    parser = PineScriptParser(sample)
    strategy = parser.parse()
    print(f"Strategy: {strategy.name}")
    print(f"Entries: {strategy.entries}")
    print("\n--- Generated Python ---")
    print(parser.to_python())
