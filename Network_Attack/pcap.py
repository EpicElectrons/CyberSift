from scapy.all import IP, TCP, Raw, wrpcap
import random
import time
import matplotlib.pyplot as plt
import networkx as nx
from collections import defaultdict
import pandas as pd
import seaborn as sns

class PCAPGenerator:
    def __init__(self):
        self.normal_ips = ["192.168.1." + str(x) for x in range(1, 10)]
        self.suspicious_ips = ["10.0.0.99", "192.168.1.100"]
        self.common_ports = [80, 443, 53, 22, 3389]
        self.suspicious_ports = [4444, 6666, 8080]
        
    def generate_sample_pcap(self, filename: str, duration_secs: int = 60):
        packets = []
        start_time = time.time()
        
        # Generate normal HTTP traffic
        print("Generating normal traffic...")
        for _ in range(100):
            packets.extend(self._generate_normal_traffic())
            
        # Generate suspicious traffic
        print("Generating suspicious traffic...")
        for _ in range(20):
            packets.extend(self._generate_suspicious_traffic())
        
        # Write packets to PCAP file
        wrpcap(filename, packets)
        print(f"PCAP file generated: {filename}")
        return packets
    
    def _generate_normal_traffic(self):
        packets = []
        src_ip = random.choice(self.normal_ips)
        dst_ip = random.choice(self.normal_ips)
        sport = random.choice(self.common_ports)
        dport = random.choice(self.common_ports)
        
        # TCP SYN
        packets.append(
            IP(src=src_ip, dst=dst_ip)/
            TCP(sport=sport, dport=dport, flags='S')
        )
        
        # TCP SYN-ACK
        packets.append(
            IP(src=dst_ip, dst=src_ip)/
            TCP(sport=dport, dport=sport, flags='SA')
        )
        
        return packets
    
    def _generate_suspicious_traffic(self):
        packets = []
        
        # Suspicious IP communication
        packets.append(
            IP(src=random.choice(self.suspicious_ips),
               dst=random.choice(self.normal_ips))/
            TCP(sport=random.choice(self.suspicious_ports),
                dport=random.choice(self.common_ports))
        )
        
        # Data exfiltration
        packets.append(
            IP(src=random.choice(self.normal_ips),
               dst=random.choice(self.suspicious_ips))/
            TCP(sport=random.choice(self.common_ports),
                dport=4444)/
            Raw(load="A" * 1500)
        )
        
        return packets

class PCAPVisualizer:
    def __init__(self):
        # Remove the problematic style.use() call
        sns.set_theme()  # This will set up the seaborn styling
    
    def analyze_pcap(self, packets):
        """Extract relevant information from packets for visualization"""
        connections = []
        ports = []
        packet_sizes = []
        
        for packet in packets:
            if TCP in packet:
                connections.append((packet[IP].src, packet[IP].dst))
                ports.extend([packet[TCP].sport, packet[TCP].dport])
                packet_sizes.append(len(packet))
        
        return {
            'connections': connections,
            'ports': ports,
            'packet_sizes': packet_sizes
        }
    
    def visualize_network_graph(self, connections):
        """Create network graph visualization"""
        plt.figure(figsize=(12, 8))
        G = nx.DiGraph()
        
        # Add edges with weights based on frequency
        edge_weights = defaultdict(int)
        for src, dst in connections:
            edge_weights[(src, dst)] += 1
        
        # Add weighted edges to graph
        for (src, dst), weight in edge_weights.items():
            G.add_edge(src, dst, weight=weight)
        
        # Draw the network graph
        pos = nx.spring_layout(G)
        nx.draw(G, pos, with_labels=True, node_color='lightblue', 
                node_size=1500, arrowsize=20, font_size=8)
        
        plt.title("Network Communication Graph")
        plt.savefig("network_graph.png")
        plt.close()
    
    def visualize_port_distribution(self, ports):
        """Create port distribution visualization"""
        plt.figure(figsize=(12, 6))
        port_counts = pd.Series(ports).value_counts()
        
        sns.barplot(x=port_counts.index.astype(str), y=port_counts.values)
        plt.title("Port Distribution")
        plt.xlabel("Port Number")
        plt.ylabel("Frequency")
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.savefig("port_distribution.png")
        plt.close()
    
    def visualize_packet_sizes(self, packet_sizes):
        """Create packet size distribution visualization"""
        plt.figure(figsize=(10, 6))
        sns.histplot(packet_sizes, bins=30)
        plt.title("Packet Size Distribution")
        plt.xlabel("Packet Size (bytes)")
        plt.ylabel("Frequency")
        plt.savefig("packet_sizes.png")
        plt.close()

def main():
    # Generate PCAP
    generator = PCAPGenerator()
    packets = generator.generate_sample_pcap("sample_traffic.pcap")
    
    # Visualize PCAP
    visualizer = PCAPVisualizer()
    data = visualizer.analyze_pcap(packets)
    
    print("Generating visualizations...")
    
    # Create visualizations
    visualizer.visualize_network_graph(data['connections'])
    visualizer.visualize_port_distribution(data['ports'])
    visualizer.visualize_packet_sizes(data['packet_sizes'])
    
    print("Visualizations generated:")
    print("1. network_graph.png - Shows communication patterns between IPs")
    print("2. port_distribution.png - Shows distribution of ports used")
    print("3. packet_sizes.png - Shows distribution of packet sizes")

if __name__ == "__main__":
    main()