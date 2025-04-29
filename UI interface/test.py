import gradio as gr
import pandas as pd
from datetime import datetime
import plotly.express as px
import plotly.graph_objects as go
import cloudinary
import cloudinary.uploader
from cloudinary.utils import cloudinary_url
import sqlite3
import os
from typing import Optional, Dict, Any, List
import json


cloudinary.config( 
    cloud_name = "ddedypwop", 
    api_key = "573567335995321", 
    api_secret = "_u2sOoetTxmTtKknRjEmuucbwPQ", # Click 'View API Keys' above to copy your API secret
    secure=True
)

def upload_to_cloudinary(file_path: str) -> Optional[Dict[str, Any]]:
    """Upload a file to Cloudinary and return its metadata"""
    try:
        response = cloudinary.uploader.upload(file_path)
        return {
            "url": response.get("url"),
            "secure_url": response.get("secure_url"),
            "public_id": response.get("public_id"),
            "version": response.get("version"),
            "signature": response.get("signature"),
            "width": response.get("width"),
            "height": response.get("height"),
            "format": response.get("format"),
            "resource_type": response.get("resource_type"),
            "created_at": response.get("created_at")
        }
    except Exception as e:
        print(f"Error uploading to Cloudinary: {e}")
        return None

# =============== Database Setup ===============

def init_db():
    """Initialize SQLite database with required tables"""
    conn = sqlite3.connect('incidents.db')
    c = conn.cursor()
    
    # Create incidents table
    c.execute('''
        CREATE TABLE IF NOT EXISTS incidents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            type TEXT NOT NULL,
            details TEXT NOT NULL,
            ip_address TEXT,
            severity TEXT NOT NULL,
            impact TEXT NOT NULL,
            risk_level TEXT NOT NULL,
            affected_systems TEXT,
            response_time REAL,
            indicators TEXT,
            status TEXT DEFAULT 'Open',
            created_at TEXT NOT NULL,
            image_metadata TEXT
        )
    ''')
    
    # Create investigations table
    c.execute('''
        CREATE TABLE IF NOT EXISTS investigations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            case_id INTEGER NOT NULL,
            investigator TEXT NOT NULL,
            status TEXT NOT NULL,
            findings TEXT NOT NULL,
            recommendations TEXT,
            evidence_links TEXT,
            artifacts_metadata TEXT,
            last_updated TEXT NOT NULL,
            FOREIGN KEY (case_id) REFERENCES incidents (id)
        )
    ''')
    
    conn.commit()
    conn.close()

# Initialize database
init_db()

class DatabaseManager:
    @staticmethod
    def insert_incident(incident_data: Dict[str, Any]) -> int:
        """Insert a new incident into the database"""
        conn = sqlite3.connect('incidents.db')
        c = conn.cursor()
        
        columns = ', '.join(incident_data.keys())
        placeholders = ', '.join(['?' for _ in incident_data])
        query = f'INSERT INTO incidents ({columns}) VALUES ({placeholders})'
        
        try:
            c.execute(query, list(incident_data.values()))
            incident_id = c.lastrowid
            conn.commit()
            return incident_id
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()

    @staticmethod
    def get_incidents() -> pd.DataFrame:
        """Retrieve all incidents from the database"""
        conn = sqlite3.connect('incidents.db')
        try:
            df = pd.read_sql_query('SELECT * FROM incidents ORDER BY id DESC', conn)
            return df
        finally:
            conn.close()

    @staticmethod
    def search_incidents(search_term: str) -> pd.DataFrame:
        """Search incidents based on a search term"""
        conn = sqlite3.connect('incidents.db')
        try:
            query = '''
                SELECT * FROM incidents 
                WHERE 
                    LOWER(details) LIKE LOWER(?) OR
                    LOWER(type) LIKE LOWER(?) OR
                    LOWER(ip_address) LIKE LOWER(?) OR
                    LOWER(affected_systems) LIKE LOWER(?)
                ORDER BY id DESC
            '''
            search_pattern = f'%{search_term}%'
            df = pd.read_sql_query(query, conn, params=[search_pattern]*4)
            return df
        finally:
            conn.close()

    @staticmethod
    def get_incident_image(incident_id: int) -> Optional[Dict[str, Any]]:
        """Retrieve image metadata for a specific incident"""
        conn = sqlite3.connect('incidents.db')
        c = conn.cursor()
        try:
            c.execute('SELECT image_metadata FROM incidents WHERE id = ?', (incident_id,))
            result = c.fetchone()
            return json.loads(result[0]) if result and result[0] else None
        finally:
            conn.close()

def get_investigation_stats() -> List[List[Any]]:
    """Get statistics about investigations"""
    conn = sqlite3.connect('incidents.db')
    c = conn.cursor()
    try:
        c.execute('''
            SELECT status, COUNT(*) as count 
            FROM investigations 
            GROUP BY status
        ''')
        results = c.fetchall()
        return [[status, count] for status, count in results]
    finally:
        conn.close()

def get_recent_investigations(limit: int = 10) -> List[tuple]:
    """Get recent investigations"""
    conn = sqlite3.connect('incidents.db')
    c = conn.cursor()
    try:
        c.execute('''
            SELECT 
                id,
                case_id,
                investigator,
                status,
                last_updated,
                SUBSTR(findings, 1, 100) || '...' as findings_summary
            FROM investigations
            ORDER BY last_updated DESC
            LIMIT ?
        ''', (limit,))
        return c.fetchall()
    finally:
        conn.close()

def search_investigations(search_type: str, term: str) -> List[tuple]:
    """Search investigations based on criteria"""
    conn = sqlite3.connect('incidents.db')
    c = conn.cursor()
    
    search_map = {
        "Case ID": "case_id",
        "Investigator": "LOWER(investigator)",
        "Status": "LOWER(status)"
    }
    
    field = search_map[search_type]
    search_term = f"%{term.lower()}%" if search_type != "Case ID" else term
    
    try:
        query = f'''
            SELECT 
                id,
                case_id,
                investigator,
                status,
                last_updated,
                SUBSTR(findings, 1, 100) || '...' as findings_summary
            FROM investigations
            WHERE {field} LIKE ?
            ORDER BY last_updated DESC
        '''
        c.execute(query, (search_term,))
        return c.fetchall()
    finally:
        conn.close()

def submit_investigation_handler(case_id, investigator, status, findings, 
                               recommendations, evidence_links, artifacts):
    """Handle investigation submission"""
    conn = sqlite3.connect('incidents.db')
    c = conn.cursor()
    
    try:
        # Validate case ID exists
        c.execute('SELECT id FROM incidents WHERE id = ?', (case_id,))
        if not c.fetchone():
            return gr.update(value="Error: Invalid Case ID")

        # Process artifacts if any
        artifacts_metadata = []
        if artifacts:
            for artifact in artifacts:
                metadata = upload_to_cloudinary(artifact.name)
                if metadata:
                    artifacts_metadata.append(metadata)

        # Insert investigation
        c.execute('''
            INSERT INTO investigations (
                case_id, investigator, status, findings, 
                recommendations, evidence_links, artifacts_metadata,
                last_updated
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            case_id,
            investigator,
            status,
            findings,
            recommendations,
            evidence_links,
            json.dumps(artifacts_metadata),
            datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        ))
        
        # Update incident status
        c.execute('''
            UPDATE incidents 
            SET status = ? 
            WHERE id = ?
        ''', ("Under Investigation", case_id))
        
        conn.commit()
        return gr.update(value="Investigation submitted successfully!")
    
    except Exception as e:
        conn.rollback()
        return gr.update(value=f"Error: {str(e)}")
    finally:
        conn.close()

def calculate_risk_level(severity: str, impact: str) -> str:
    """Calculate risk level based on severity and impact"""
    risk_matrix = {
        ("Critical", "High"): "Severe",
        ("Critical", "Medium"): "High",
        ("Critical", "Low"): "Medium",
        ("High", "High"): "High",
        ("High", "Medium"): "Medium",
        ("High", "Low"): "Medium",
        ("Medium", "High"): "Medium",
        ("Medium", "Medium"): "Medium",
        ("Medium", "Low"): "Low",
        ("Low", "High"): "Medium",
        ("Low", "Medium"): "Low",
        ("Low", "Low"): "Low"
    }
    return risk_matrix.get((severity, impact), "Medium")

def submit_case(details, attack_date, attack_type, ip_address, severity, impact,
                affected_systems, response_time, image, indicators):
    """Handle new incident submission"""
    try:
        # Validate inputs
        if not all([details, attack_date, attack_type, severity, impact]):
            return (
                gr.update(value="Error: Please fill in all required fields"),
                None, None, None, None
            )
            
        datetime.strptime(attack_date, '%Y-%m-%d')
        risk_level = calculate_risk_level(severity, impact)
        
        image_metadata = None
        if image:
            image_metadata = upload_to_cloudinary(image)
            
        incident_data = {
            "date": attack_date,
            "type": attack_type,
            "details": details,
            "ip_address": ip_address,
            "severity": severity,
            "impact": impact,
            "risk_level": risk_level,
            "affected_systems": affected_systems,
            "response_time": response_time,
            "indicators": indicators,
            "status": "Open",
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "image_metadata": json.dumps(image_metadata) if image_metadata else None
        }
        
        incident_id = DatabaseManager.insert_incident(incident_data)
        
        return (
            gr.update(value=f"Case #{incident_id} Registered Successfully!"),
            generate_incidents_chart(),
            generate_risk_matrix(),
            update_incident_table(),
            None
        )
    except ValueError:
        return (
            gr.update(value="Error: Invalid date format. Use YYYY-MM-DD"),
            None, None, None, None
        )
    except Exception as e:
        return (
            gr.update(value=f"Error: {str(e)}"),
            None, None, None, None
        )

def create_interface() -> gr.Blocks:
    """Create and configure the Gradio interface"""
    with gr.Blocks(theme=gr.themes.Soft()) as interface:
        # Header
        gr.HTML("""
            <style>
            .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
            .stat-box {
                background: linear-gradient(135deg, #2563eb, #1d4ed8);
                color: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                margin: 10px;
                text-align: center;
            }
            .form-card {
                background: white;
                padding: 24px;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                margin-bottom: 20px;
            }
            .header {
                text-align: center;
                padding: 20px;
                margin-bottom: 30px;
                background: linear-gradient(135deg, #1e40af, #1d4ed8);
                color: white;
                border-radius: 12px;
            }
            </style>
        """)

        with gr.Row():
            gr.HTML("""
                <div class="header">
                    <h1>🛡️ Cybersecurity Incident Management System</h1>
                    <p>Enterprise-grade incident tracking and response</p>
                </div>
            """)

        with gr.Tabs():
            # New Incident Tab
            with gr.Tab("📝 New Incident"):
                with gr.Row():
                    with gr.Column():
                        with gr.Group():
                            details = gr.Textbox(
                                label="Attack Description*",
                                placeholder="Provide detailed description...",
                                lines=3
                            )
                            attack_date = gr.Textbox(
                                label="Date of Attack*",
                                placeholder="YYYY-MM-DD",
                                value=datetime.now().strftime("%Y-%m-%d")
                            )
                            attack_type = gr.Dropdown(
                                choices=["Phishing", "Ransomware", "DDoS", "Malware", 
                                        "SQL Injection", "Social Engineering", 
                                        "Zero-day Exploit", "Other"],
                                label="Attack Type*"
                            )
                            severity = gr.Dropdown(
                                choices=["Low", "Medium", "High", "Critical"],
                                label="Severity Level*"
                            )
                            impact = gr.Dropdown(
                                choices=["Low", "Medium", "High"],
                                label="Business Impact*"
                            )
                    
                    with gr.Column():
                        with gr.Group():
                            ip_address = gr.Textbox(
                                label="Source IP Address",
                                placeholder="xxx.xxx.xxx.xxx"
                            )
                            affected_systems = gr.Textbox(
                                label="Affected Systems",
                                placeholder="List affected systems..."
                            )
                            response_time = gr.Number(
                                label="Response Time (hours)",
                                value=0
                            )
                            indicators = gr.Textbox(
                                label="Indicators of Compromise",
                                placeholder="List IOCs...",
                                lines=2
                            )
                            image = gr.File(
                                label="Upload Evidence",
                                type="filepath"
                            )

                submit_btn = gr.Button("Submit")
                output_msg = gr.Textbox(label="Status")

                # Event handler for submit button
                submit_btn.click(
                    fn=submit_case,
                    inputs=[
                        details, attack_date, attack_type, ip_address,
                        severity, impact, affected_systems, response_time,
                        image, indicators
                    ],
                    outputs=[
                        output_msg,
                        gr.Plot(label="chart"),
                        gr.Plot(label="risk_matrix"),
                        gr.DataFrame(label="incident_table"),
                        image
                    ]
                )

            # Dashboard Tab
            with gr.Tab("📊 Dashboard"):
                stats = get_dashboard_stats()
                with gr.Row():
                    for title, value in [
                        ("Total Incidents", stats["total_incidents"]),
                        ("Critical Incidents", stats["critical_incidents"]),
                        ("Open Incidents", stats["open_incidents"]),
                        ("Avg Response Time (hrs)", 
                         round(stats["avg_response_time"], 2))
                    ]:
                        with gr.Column():
                            gr.Label(f"{title}: {value}")

                with gr.Row():
                    chart = gr.Plot(value=generate_incidents_chart())
                    risk_matrix = gr.Plot(value=generate_risk_matrix())
                
                incident_table = gr.DataFrame(
                    value=update_incident_table(),
                    interactive=False
                )

            # Investigation Tab
            with gr.Tab("🔍 Investigation"):
                with gr.Row():
                    with gr.Column():
                        case_id = gr.Number(label="Case ID*")
                        investigator = gr.Textbox(label="Investigator*")
                        status = gr.Dropdown(
                            choices=["In Progress", "Completed", "Pending Review", "Need More Info"],
                            label="Investigation Status*"
                        )
                        findings = gr.Textbox(
                            label="Investigation Findings*",
                            placeholder="Detail your findings...",
                            lines=4
                        )
                        recommendations = gr.Textbox(
                            label="Recommendations",
                            placeholder="List recommended actions...",
                            lines=3
                        )
                        evidence_links = gr.Textbox(
                            label="Evidence Links",
                            placeholder="Add links to evidence..."
                        )
                        artifacts = gr.File(
                            label="Upload Investigation Artifacts",
                            file_count="multiple"
                        )
                        submit_investigation = gr.Button("Submit Investigation")
                        investigation_status = gr.Textbox(label="Status")

                # Investigation Search Section
                with gr.Row():
                    search_type = gr.Dropdown(
                        choices=["Case ID", "Investigator", "Status"],
                        label="Search By",
                        value="Case ID"
                    )
                    search_term = gr.Textbox(label="Search Term")
                    search_button = gr.Button("Search")
                    
                investigation_results = gr.DataFrame(
                    headers=["ID", "Case ID", "Investigator", "Status", 
                            "Last Updated", "Findings Summary"],
                    label="Investigation Results"
                )

                # Event handlers for investigation tab
                submit_investigation.click(
                    fn=submit_investigation_handler,
                    inputs=[
                        case_id,
                        investigator,
                        status,
                        findings,
                        recommendations,
                        evidence_links,
                        artifacts
                    ],
                    outputs=[investigation_status]
                )

                search_button.click(
                    fn=search_investigations,
                    inputs=[search_type, search_term],
                    outputs=[investigation_results]
                )

            # Analytics Tab
            with gr.Tab("📈 Analytics"):
                with gr.Row():
                    with gr.Column():
                        time_range = gr.Dropdown(
                            choices=["Last 7 Days", "Last 30 Days", "Last 90 Days", "All Time"],
                            label="Time Range",
                            value="Last 30 Days"
                        )
                        metric_type = gr.Dropdown(
                            choices=["Incident Types", "Severity Distribution", 
                                   "Response Times", "Risk Levels"],
                            label="Metric",
                            value="Incident Types"
                        )
                    
                    with gr.Column():
                        visualization_type = gr.Dropdown(
                            choices=["Bar Chart", "Pie Chart", "Line Graph"],
                            label="Visualization Type",
                            value="Bar Chart"
                        )
                
                analytics_plot = gr.Plot(label="Analytics Visualization")
                
                # Update analytics plot when inputs change
                for input_component in [time_range, metric_type, visualization_type]:
                    input_component.change(
                        fn=update_analytics_plot,
                        inputs=[time_range, metric_type, visualization_type],
                        outputs=[analytics_plot]
                    )

            return interface
def update_analytics_plot(time_range: str, metric_type: str, 
                         visualization_type: str) -> go.Figure:
    """Generate analytics visualization based on selected parameters"""
    conn = sqlite3.connect('incidents.db')
    
    # Calculate date range
    end_date = datetime.now()
    if time_range == "Last 7 Days":
        days = 7
    elif time_range == "Last 30 Days":
        days = 30
    elif time_range == "Last 90 Days":
        days = 90
    else:  # All Time
        days = None
    
    try:
        if days:
            start_date = end_date - pd.Timedelta(days=days)
            df = pd.read_sql_query(
                'SELECT * FROM incidents WHERE date >= ?',
                conn,
                params=[start_date.strftime('%Y-%m-%d')]
            )
        else:
            df = pd.read_sql_query('SELECT * FROM incidents', conn)
        
        if metric_type == "Incident Types":
            data = df['type'].value_counts()
            title = "Distribution of Incident Types"
        elif metric_type == "Severity Distribution":
            data = df['severity'].value_counts()
            title = "Distribution of Severity Levels"
        elif metric_type == "Response Times":
            data = df.groupby('type')['response_time'].mean()
            title = "Average Response Times by Incident Type"
        else:  # Risk Levels
            data = df['risk_level'].value_counts()
            title = "Distribution of Risk Levels"
        
        if visualization_type == "Bar Chart":
            fig = px.bar(
                x=data.index,
                y=data.values,
                title=title
            )
        elif visualization_type == "Pie Chart":
            fig = px.pie(
                values=data.values,
                names=data.index,
                title=title
            )
        else:  # Line Graph
            # For line graph, we need temporal data
            df['date'] = pd.to_datetime(df['date'])
            temporal_data = df.groupby('date').size()
            fig = px.line(
                x=temporal_data.index,
                y=temporal_data.values,
                title="Incident Trend Over Time"
            )
        
        fig.update_layout(
            template="plotly_white",
            margin=dict(t=50, l=50, r=50, b=50)
        )
        
        return fig
    
    finally:
        conn.close()

def get_dashboard_stats() -> Dict[str, Any]:
    """Calculate dashboard statistics"""
    conn = sqlite3.connect('incidents.db')
    try:
        df = pd.read_sql_query('SELECT * FROM incidents', conn)
        return {
            "total_incidents": len(df),
            "critical_incidents": len(df[df['severity'] == 'Critical']),
            "open_incidents": len(df[df['status'] == 'Open']),
            "avg_response_time": df['response_time'].mean() or 0
        }
    finally:
        conn.close()

def generate_incidents_chart() -> go.Figure:
    """Generate time series chart of incidents"""
    df = DatabaseManager.get_incidents()
    df['date'] = pd.to_datetime(df['date'])
    daily_counts = df.groupby('date').size()
    
    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=daily_counts.index,
        y=daily_counts.values,
        mode='lines+markers',
        name='Incidents'
    ))
    
    fig.update_layout(
        title="Daily Incident Count",
        xaxis_title="Date",
        yaxis_title="Number of Incidents",
        template="plotly_white"
    )
    
    return fig

def generate_risk_matrix() -> go.Figure:
    """Generate risk matrix visualization"""
    df = DatabaseManager.get_incidents()
    
    # Create risk matrix heatmap
    severity_order = ['Low', 'Medium', 'High', 'Critical']
    impact_order = ['Low', 'Medium', 'High']
    
    matrix_data = pd.crosstab(
        df['severity'],
        df['impact']
    ).reindex(index=severity_order, columns=impact_order, fill_value=0)
    
    fig = px.imshow(
        matrix_data,
        labels=dict(x="Business Impact", y="Severity", color="Count"),
        title="Risk Matrix"
    )
    
    fig.update_layout(
        template="plotly_white",
        margin=dict(t=50, l=50, r=50, b=50)
    )
    
    return fig

def update_incident_table() -> pd.DataFrame:
    """Update incident table display"""
    df = DatabaseManager.get_incidents()
    display_columns = [
        'id', 'date', 'type', 'severity', 'status',
        'details', 'response_time'
    ]
    return df[display_columns]

# Launch the interface
if __name__ == "__main__":
    interface = create_interface()

    interface.launch(
        # server_name="0.0.0.0",
        # server_port=7860,
        # share=True
    )