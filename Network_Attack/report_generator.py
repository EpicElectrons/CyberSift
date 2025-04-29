from datetime import datetime
from typing import Dict, Any, List
import json
import markdown
import plotly.graph_objects as go

class ForensicReport:
    def __init__(self, case_id: str, investigator: str):
        self.case_id = case_id
        self.investigator = investigator
        self.timestamp = datetime.now()
        self.sections = []
        self.findings = []
        self.recommendations = []
        
    def add_attack_details(self, attack_info: Dict[str, Any]):
        """Add details about the detected attack"""
        self.sections.append({
            "title": "Attack Classification",
            "content": {
                "attack_type": attack_info["type"],
                "confidence": attack_info["confidence"],
                "indicators": attack_info["indicators"],
                "xai_explanation": attack_info["explanation"]
            }
        })

    def add_tool_results(self, tool_results: List[Dict[str, Any]]):
        """Add results from forensic tools"""
        for result in tool_results:
            self.sections.append({
                "title": f"Analysis Results: {result['tool_name']}",
                "content": {
                    "findings": result["findings"],
                    "artifacts": result["artifacts"],
                    "timestamps": result["timestamps"]
                }
            })

    def add_network_analysis(self, network_data: Dict[str, Any]):
        """Add network analysis results"""
        self.sections.append({
            "title": "Network Analysis",
            "content": {
                "traffic_patterns": network_data["patterns"],
                "suspicious_ips": network_data["suspicious_ips"],
                "protocols": network_data["protocols"],
                "timeline": network_data["timeline"]
            }
        })

    def generate_timeline(self, events: List[Dict[str, Any]]) -> str:
        """Generate a timeline visualization"""
        fig = go.Figure(data=[
            go.Scatter(
                x=[event["timestamp"] for event in events],
                y=[event["description"] for event in events],
                mode="markers+lines",
                name="Event Timeline"
            )
        ])
        return fig.to_html()

    def generate_html_report(self) -> str:
        """Generate a formatted HTML report"""
        template = """
        <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; }
                    .section { margin: 20px; padding: 15px; border: 1px solid #ddd; }
                    .finding { background: #f9f9f9; padding: 10px; margin: 5px 0; }
                    .timeline { margin: 20px 0; }
                    .xai-explanation { background: #e9f7ef; padding: 15px; }
                </style>
            </head>
            <body>
                <h1>Forensic Analysis Report</h1>
                <div class="metadata">
                    <p>Case ID: {case_id}</p>
                    <p>Investigator: {investigator}</p>
                    <p>Generated: {timestamp}</p>
                </div>
                {content}
            </body>
        </html>
        """
        
        content = ""
        for section in self.sections:
            content += f"<div class='section'><h2>{section['title']}</h2>"
            content += self._format_section_content(section['content'])
            content += "</div>"
            
        return template.format(
            case_id=self.case_id,
            investigator=self.investigator,
            timestamp=self.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            content=content
        )

    def _format_section_content(self, content: Dict) -> str:
        """Format section content based on type"""
        formatted = ""
        for key, value in content.items():
            if isinstance(value, dict):
                formatted += f"<h3>{key}</h3>"
                formatted += self._format_section_content(value)
            elif isinstance(value, list):
                formatted += f"<h3>{key}</h3><ul>"
                for item in value:
                    formatted += f"<li>{item}</li>"
                formatted += "</ul>"
            else:
                formatted += f"<p><strong>{key}:</strong> {value}</p>"
        return formatted

    def save_report(self, output_path: str):
        """Save the report to file"""
        html_content = self.generate_html_report()
        with open(output_path, 'w') as f:
            f.write(html_content)