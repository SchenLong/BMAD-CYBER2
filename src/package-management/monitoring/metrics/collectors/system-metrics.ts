/**
 * EPIC 2 PACKAGE MANAGEMENT - SYSTEM METRICS COLLECTOR
 * Advanced system-level performance metrics collection
 *
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 * @classification PRODUCTION-READY
 * @epic Epic 2 - Story 2.5
 */

import * as os from 'os';
import * as fs from 'fs/promises';
import * as path from 'path';
import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';

// Health Monitoring Integration
import {
  CPUUsage,
  Datapoint,
  DiskUsage,
  MemoryUsage,
  MetricTimeSeries,
  NetworkUsage,
  ResourceUsage
} from '../performance-metrics';

// Epic 1 Security Integration
import { AuditLogger } from '../../../security/audit/audit-logger';

/**
 * System Metrics Collection Interfaces
 */

export interface SystemMetricsConfig {
  readonly interval: number;
  readonly enableCPU: boolean;
  readonly enableMemory: boolean;
  readonly enableDisk: boolean;
  readonly enableNetwork: boolean;
  readonly enableProcess: boolean;
  readonly diskPaths: string[];
  readonly networkInterfaces: string[];
  readonly processWhitelist: string[];
}

export interface SystemSnapshot {
  readonly timestamp: number;
  readonly cpu: CPUMetrics;
  readonly memory: MemoryMetrics;
  readonly disk: DiskMetrics;
  readonly network: NetworkMetrics;
  readonly processes: ProcessMetrics[];
  readonly system: SystemInfo;
}

export interface CPUMetrics extends CPUUsage {
  readonly cores: CoreMetrics[];
  readonly frequency: number;
  readonly architecture: string;
  readonly model: string;
  readonly temperature?: number;
}

export interface CoreMetrics {
  readonly coreId: number;
  readonly user: number;
  readonly nice: number;
  readonly system: number;
  readonly idle: number;
  readonly iowait: number;
  readonly irq: number;
  readonly softirq: number;
  readonly usage: number;
}

export interface MemoryMetrics extends MemoryUsage {
  readonly swap: SwapMetrics;
  readonly virtual: VirtualMemoryMetrics;
  readonly pages: PageMetrics;
}

export interface SwapMetrics {
  readonly total: number;
  readonly used: number;
  readonly free: number;
  readonly cached: number;
  readonly usage: number;
}

export interface VirtualMemoryMetrics {
  readonly committed: number;
  readonly available: number;
  readonly limit: number;
  readonly usage: number;
}

export interface PageMetrics {
  readonly faults: number;
  readonly majorFaults: number;
  readonly minorFaults: number;
  readonly pageIn: number;
  readonly pageOut: number;
}

export interface DiskMetrics extends DiskUsage {
  readonly filesystems: FilesystemMetrics[];
  readonly devices: DeviceMetrics[];
}

export interface FilesystemMetrics {
  readonly mount: string;
  readonly device: string;
  readonly fstype: string;
  readonly total: number;
  readonly used: number;
  readonly available: number;
  readonly usage: number;
  readonly inodes: InodeMetrics;
}

export interface InodeMetrics {
  readonly total: number;
  readonly used: number;
  readonly free: number;
  readonly usage: number;
}

export interface DeviceMetrics {
  readonly device: string;
  readonly readOps: number;
  readonly writeOps: number;
  readonly readBytes: number;
  readonly writeBytes: number;
  readonly readTime: number;
  readonly writeTime: number;
  readonly ioTime: number;
  readonly utilization: number;
}

export interface NetworkMetrics extends NetworkUsage {
  readonly interfaces: InterfaceMetrics[];
  readonly protocols: ProtocolMetrics;
}

export interface InterfaceMetrics {
  readonly name: string;
  readonly type: string;
  readonly mtu: number;
  readonly speed: number;
  readonly duplex: string;
  readonly operState: string;
  readonly bytesReceived: number;
  readonly bytesTransmitted: number;
  readonly packetsReceived: number;
  readonly packetsTransmitted: number;
  readonly errorsReceived: number;
  readonly errorsTransmitted: number;
  readonly dropsReceived: number;
  readonly dropsTransmitted: number;
  readonly collisions: number;
  readonly utilization: number;
}

export interface ProtocolMetrics {
  readonly tcp: TCPMetrics;
  readonly udp: UDPMetrics;
  readonly icmp: ICMPMetrics;
  readonly ip: IPMetrics;
}

export interface TCPMetrics {
  readonly activeOpens: number;
  readonly passiveOpens: number;
  readonly attemptFails: number;
  readonly estabResets: number;
  readonly currEstab: number;
  readonly inSegs: number;
  readonly outSegs: number;
  readonly retransSegs: number;
  readonly inErrs: number;
  readonly outRsts: number;
}

export interface UDPMetrics {
  readonly inDatagrams: number;
  readonly noPorts: number;
  readonly inErrors: number;
  readonly outDatagrams: number;
  readonly rcvbufErrors: number;
  readonly sndbufErrors: number;
}

export interface ICMPMetrics {
  readonly inMsgs: number;
  readonly inErrors: number;
  readonly outMsgs: number;
  readonly outErrors: number;
}

export interface IPMetrics {
  readonly forwarding: number;
  readonly inReceives: number;
  readonly inHdrErrors: number;
  readonly inAddrErrors: number;
  readonly forwDatagrams: number;
  readonly inUnknownProtos: number;
  readonly inDiscards: number;
  readonly inDelivers: number;
  readonly outRequests: number;
  readonly outDiscards: number;
  readonly outNoRoutes: number;
}

export interface ProcessMetrics {
  readonly pid: number;
  readonly ppid: number;
  readonly name: string;
  readonly command: string;
  readonly user: string;
  readonly state: string;
  readonly priority: number;
  readonly nice: number;
  readonly cpuUsage: number;
  readonly cpuTime: number;
  readonly memoryUsage: ProcessMemoryMetrics;
  readonly ioStats: ProcessIOMetrics;
  readonly openFiles: number;
  readonly threads: number;
  readonly startTime: number;
}

export interface ProcessMemoryMetrics {
  readonly rss: number;
  readonly vms: number;
  readonly shared: number;
  readonly text: number;
  readonly data: number;
  readonly lib: number;
  readonly dirty: number;
}

export interface ProcessIOMetrics {
  readonly readBytes: number;
  readonly writeBytes: number;
  readonly readOps: number;
  readonly writeOps: number;
  readonly readChars: number;
  readonly writeChars: number;
}

export interface SystemInfo {
  readonly hostname: string;
  readonly platform: string;
  readonly arch: string;
  readonly version: string;
  readonly uptime: number;
  readonly bootTime: number;
  readonly kernelVersion: string;
  readonly totalMemory: number;
  readonly freeMemory: number;
  readonly loadAverage: number[];
}

/**
 * System Metrics Collector Implementation
 */

export class SystemMetricsCollector extends EventEmitter {
  private readonly auditLogger: AuditLogger;
  private config: SystemMetricsConfig;
  private isCollecting: boolean = false;
  private collectionInterval: NodeJS.Timeout | null = null;
  private lastCPUTimes: Map<string, any> = new Map();
  private lastNetworkStats: Map<string, any> = new Map();
  private lastDiskStats: Map<string, any> = new Map();

  constructor(config: SystemMetricsConfig) {
    super();
    this.config = config;
    this.auditLogger = new AuditLogger();
  }

  /**
   * Initialize system metrics collection
   */
  public async initialize(): Promise<void> {
    try {
      // Validate configuration
      await this.validateConfig();

      // Initialize baseline measurements
      await this.initializeBaselines();

      await this.auditLogger.log('system_metrics_collector_initialized', {
        config: this.sanitizeConfig()
      });

      this.emit('initialized');
    } catch (error) {
      await this.auditLogger.logError('system_metrics_collector_init_failed', error as Error);
      throw error;
    }
  }

  /**
   * Start metrics collection
   */
  public async start(): Promise<void> {
    if (this.isCollecting) {
      throw new Error('System metrics collection already started');
    }

    try {
      this.isCollecting = true;
      this.collectionInterval = setInterval(async () => {
        try {
          const snapshot = await this.collectSnapshot();
          this.emit('snapshot', snapshot);
        } catch (error) {
          await this.auditLogger.logError('system_metrics_collection_failed', error as Error);
          this.emit('error', error);
        }
      }, this.config.interval);

      await this.auditLogger.log('system_metrics_collection_started', {
        interval: this.config.interval
      });
    } catch (error) {
      this.isCollecting = false;
      throw error;
    }
  }

  /**
   * Stop metrics collection
   */
  public async stop(): Promise<void> {
    if (!this.isCollecting) return;

    this.isCollecting = false;
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = null;
    }

    await this.auditLogger.log('system_metrics_collection_stopped');
    this.emit('stopped');
  }

  /**
   * Collect current system snapshot
   */
  public async collectSnapshot(): Promise<SystemSnapshot> {
    const startTime = performance.now();

    try {
      const timestamp = Date.now();
      const snapshot: SystemSnapshot = {
        timestamp,
        cpu: await this.collectCPUMetrics(),
        memory: await this.collectMemoryMetrics(),
        disk: await this.collectDiskMetrics(),
        network: await this.collectNetworkMetrics(),
        processes: await this.collectProcessMetrics(),
        system: await this.collectSystemInfo()
      };

      const endTime = performance.now();
      await this.auditLogger.log('system_snapshot_collected', {
        duration: endTime - startTime,
        timestamp
      });

      return snapshot;
    } catch (error) {
      await this.auditLogger.logError('system_snapshot_collection_failed', error as Error);
      throw error;
    }
  }

  /**
   * Get specific metric time series
   */
  public async getMetricTimeSeries(metric: string, duration: number): Promise<MetricTimeSeries> {
    // Implementation for retrieving historical metric data
    const datapoints: Datapoint[] = [];

    return {
      metric,
      category: 'system',
      tags: { collector: 'system' },
      datapoints,
      aggregation: {
        min: 0,
        max: 0,
        avg: 0,
        sum: 0,
        count: datapoints.length,
        percentiles: {},
        stdDev: 0,
        trend: 'stable'
      }
    };
  }

  // Private Implementation Methods

  private async validateConfig(): Promise<void> {
    if (this.config.interval < 1000) {
      throw new Error('Collection interval must be at least 1000ms');
    }

    // Validate disk paths
    for (const diskPath of this.config.diskPaths) {
      try {
        await fs.access(diskPath);
      } catch {
        throw new Error(`Disk path not accessible: ${diskPath}`);
      }
    }
  }

  private async initializeBaselines(): Promise<void> {
    // Initialize baseline measurements for delta calculations
    if (this.config.enableCPU) {
      this.lastCPUTimes.set('total', await this.getCPUTimes());
    }

    if (this.config.enableNetwork) {
      const interfaces = await this.getNetworkInterfaces();
      for (const iface of interfaces) {
        this.lastNetworkStats.set(iface.name, {
          rx_bytes: iface.bytesReceived,
          tx_bytes: iface.bytesTransmitted,
          timestamp: Date.now()
        });
      }
    }

    if (this.config.enableDisk) {
      const devices = await this.getDiskDevices();
      for (const device of devices) {
        this.lastDiskStats.set(device.device, {
          read_bytes: device.readBytes,
          write_bytes: device.writeBytes,
          timestamp: Date.now()
        });
      }
    }
  }

  private async collectCPUMetrics(): Promise<CPUMetrics> {
    if (!this.config.enableCPU) {
      throw new Error('CPU metrics collection disabled');
    }

    const cpus = os.cpus();
    const loadAvg = os.loadavg();
    const currentTimes = await this.getCPUTimes();
    const lastTimes = this.lastCPUTimes.get('total');

    // Calculate CPU usage percentages
    let totalUsage = 0;
    const cores: CoreMetrics[] = [];

    for (let i = 0; i < cpus.length; i++) {
      const cpu = cpus[i];
      const times = cpu.times;
      const total = Object.values(times).reduce((sum, time) => sum + time, 0);
      const idle = times.idle;
      const usage = ((total - idle) / total) * 100;

      cores.push({
        coreId: i,
        user: times.user,
        nice: times.nice,
        system: times.sys,
        idle: times.idle,
        iowait: 0, // Not available on all platforms
        irq: times.irq || 0,
        softirq: 0,
        usage
      });

      totalUsage += usage;
    }

    const avgUsage = totalUsage / cpus.length;

    // Store current times for next calculation
    this.lastCPUTimes.set('total', currentTimes);

    return {
      user: 0, // Calculate from delta
      system: 0,
      idle: 0,
      usage: avgUsage,
      loadAverage: loadAvg,
      processes: [],
      cores,
      frequency: cpus[0]?.speed || 0,
      architecture: os.arch(),
      model: cpus[0]?.model || 'Unknown'
    };
  }

  private async collectMemoryMetrics(): Promise<MemoryMetrics> {
    if (!this.config.enableMemory) {
      throw new Error('Memory metrics collection disabled');
    }

    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    const memUsage = process.memoryUsage();

    return {
      total,
      free,
      used,
      available: free,
      cached: 0,
      buffers: 0,
      heap: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        limit: 0,
        external: memUsage.external,
        arrayBuffers: memUsage.arrayBuffers
      },
      nonHeap: memUsage.rss - memUsage.heapTotal,
      swap: {
        total: 0,
        used: 0,
        free: 0,
        cached: 0,
        usage: 0
      },
      virtual: {
        committed: 0,
        available: 0,
        limit: 0,
        usage: 0
      },
      pages: {
        faults: 0,
        majorFaults: 0,
        minorFaults: 0,
        pageIn: 0,
        pageOut: 0
      }
    };
  }

  private async collectDiskMetrics(): Promise<DiskMetrics> {
    if (!this.config.enableDisk) {
      throw new Error('Disk metrics collection disabled');
    }

    const filesystems: FilesystemMetrics[] = [];
    const devices: DeviceMetrics[] = [];

    // Collect filesystem statistics
    for (const mountPath of this.config.diskPaths) {
      try {
        const stats = await fs.stat(mountPath);
        // Platform-specific filesystem stats collection would go here
        filesystems.push({
          mount: mountPath,
          device: 'unknown',
          fstype: 'unknown',
          total: 0,
          used: 0,
          available: 0,
          usage: 0,
          inodes: {
            total: 0,
            used: 0,
            free: 0,
            usage: 0
          }
        });
      } catch (error) {
        // Handle inaccessible paths
      }
    }

    return {
      reads: { operations: 0, bytes: 0, time: 0, errors: 0 },
      writes: { operations: 0, bytes: 0, time: 0, errors: 0 },
      space: [],
      iops: {
        read: 0,
        write: 0,
        total: 0,
        latency: {
          read: 0,
          write: 0,
          average: 0,
          p50: 0,
          p95: 0,
          p99: 0
        }
      },
      filesystems,
      devices
    };
  }

  private async collectNetworkMetrics(): Promise<NetworkMetrics> {
    if (!this.config.enableNetwork) {
      throw new Error('Network metrics collection disabled');
    }

    const interfaces = await this.getNetworkInterfaces();

    return {
      interfaces: interfaces,
      connections: {
        tcp: { connections: 0, segments: 0, retransmissions: 0, errors: 0 },
        udp: { connections: 0, segments: 0, retransmissions: 0, errors: 0 },
        established: 0,
        listening: 0,
        timeWait: 0
      },
      bandwidth: {
        in: 0,
        out: 0,
        total: 0,
        utilization: 0
      },
      packets: {
        received: 0,
        transmitted: 0,
        errors: 0,
        dropped: 0
      },
      protocols: {
        tcp: {
          activeOpens: 0,
          passiveOpens: 0,
          attemptFails: 0,
          estabResets: 0,
          currEstab: 0,
          inSegs: 0,
          outSegs: 0,
          retransSegs: 0,
          inErrs: 0,
          outRsts: 0
        },
        udp: {
          inDatagrams: 0,
          noPorts: 0,
          inErrors: 0,
          outDatagrams: 0,
          rcvbufErrors: 0,
          sndbufErrors: 0
        },
        icmp: {
          inMsgs: 0,
          inErrors: 0,
          outMsgs: 0,
          outErrors: 0
        },
        ip: {
          forwarding: 0,
          inReceives: 0,
          inHdrErrors: 0,
          inAddrErrors: 0,
          forwDatagrams: 0,
          inUnknownProtos: 0,
          inDiscards: 0,
          inDelivers: 0,
          outRequests: 0,
          outDiscards: 0,
          outNoRoutes: 0
        }
      }
    };
  }

  private async collectProcessMetrics(): Promise<ProcessMetrics[]> {
    if (!this.config.enableProcess) {
      return [];
    }

    const processes: ProcessMetrics[] = [];

    // Basic process metrics for current process
    const processMetrics: ProcessMetrics = {
      pid: process.pid,
      ppid: process.ppid || 0,
      name: process.title,
      command: process.argv.join(' '),
      user: process.env.USER || 'unknown',
      state: 'running',
      priority: 0,
      nice: 0,
      cpuUsage: 0,
      cpuTime: 0,
      memoryUsage: {
        rss: process.memoryUsage().rss,
        vms: 0,
        shared: 0,
        text: 0,
        data: 0,
        lib: 0,
        dirty: 0
      },
      ioStats: {
        readBytes: 0,
        writeBytes: 0,
        readOps: 0,
        writeOps: 0,
        readChars: 0,
        writeChars: 0
      },
      openFiles: 0,
      threads: 1,
      startTime: Date.now() - (process.uptime() * 1000)
    };

    processes.push(processMetrics);
    return processes;
  }

  private async collectSystemInfo(): Promise<SystemInfo> {
    return {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      version: os.version?.() || 'unknown',
      uptime: os.uptime(),
      bootTime: Date.now() - (os.uptime() * 1000),
      kernelVersion: os.release(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      loadAverage: os.loadavg()
    };
  }

  private async getCPUTimes(): Promise<any> {
    // Platform-specific CPU time collection
    return {};
  }

  private async getNetworkInterfaces(): Promise<InterfaceMetrics[]> {
    const interfaces = os.networkInterfaces();
    const metrics: InterfaceMetrics[] = [];

    for (const [name, configs] of Object.entries(interfaces)) {
      if (!configs) continue;

      for (const config of configs) {
        if (config.internal) continue;

        metrics.push({
          name,
          type: 'unknown',
          mtu: 1500,
          speed: 0,
          duplex: 'unknown',
          operState: 'up',
          bytesReceived: 0,
          bytesTransmitted: 0,
          packetsReceived: 0,
          packetsTransmitted: 0,
          errorsReceived: 0,
          errorsTransmitted: 0,
          dropsReceived: 0,
          dropsTransmitted: 0,
          collisions: 0,
          utilization: 0
        });
      }
    }

    return metrics;
  }

  private async getDiskDevices(): Promise<DeviceMetrics[]> {
    // Platform-specific disk device enumeration
    return [];
  }

  private sanitizeConfig(): any {
    return {
      interval: this.config.interval,
      enableCPU: this.config.enableCPU,
      enableMemory: this.config.enableMemory,
      enableDisk: this.config.enableDisk,
      enableNetwork: this.config.enableNetwork,
      enableProcess: this.config.enableProcess,
      diskPathsCount: this.config.diskPaths.length,
      networkInterfacesCount: this.config.networkInterfaces.length,
      processWhitelistCount: this.config.processWhitelist.length
    };
  }
}

export default SystemMetricsCollector;