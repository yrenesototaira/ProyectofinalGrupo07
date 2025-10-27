package com.marakosgrill.auth.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/debug")
@CrossOrigin(origins = "*")
public class DebugController {

    @Autowired
    private DataSource dataSource;

    @GetMapping("/db-connections")
    public ResponseEntity<?> getDatabaseConnections() {
        try (Connection connection = dataSource.getConnection()) {
            String query = "SELECT pid, usename, application_name, client_addr, state, query_start " +
                          "FROM pg_stat_activity WHERE datname = 'db_marakos_grill'";
            
            PreparedStatement stmt = connection.prepareStatement(query);
            ResultSet rs = stmt.executeQuery();
            
            List<Map<String, Object>> connections = new ArrayList<>();
            while (rs.next()) {
                Map<String, Object> conn = new HashMap<>();
                conn.put("pid", rs.getInt("pid"));
                conn.put("usename", rs.getString("usename"));
                conn.put("application_name", rs.getString("application_name"));
                conn.put("client_addr", rs.getString("client_addr"));
                conn.put("state", rs.getString("state"));
                conn.put("query_start", rs.getTimestamp("query_start"));
                connections.add(conn);
            }
            
            return ResponseEntity.ok(connections);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/connection-count")
    public ResponseEntity<?> getConnectionCount() {
        try (Connection connection = dataSource.getConnection()) {
            String query = "SELECT count(*) as total_connections FROM pg_stat_activity WHERE datname = 'db_marakos_grill'";
            
            PreparedStatement stmt = connection.prepareStatement(query);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                Map<String, Object> result = new HashMap<>();
                result.put("total_connections", rs.getInt("total_connections"));
                return ResponseEntity.ok(result);
            }
            
            return ResponseEntity.ok(Map.of("total_connections", 0));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/datasource-info")
    public ResponseEntity<?> getDataSourceInfo() {
        try {
            Map<String, Object> info = new HashMap<>();
            info.put("dataSource_class", dataSource.getClass().getName());
            
            // Si es HikariCP (muy común en Spring Boot)
            if (dataSource.getClass().getName().contains("Hikari")) {
                try {
                    com.zaxxer.hikari.HikariDataSource hikariDS = (com.zaxxer.hikari.HikariDataSource) dataSource;
                    info.put("maximum_pool_size", hikariDS.getMaximumPoolSize());
                    info.put("active_connections", hikariDS.getHikariPoolMXBean().getActiveConnections());
                    info.put("idle_connections", hikariDS.getHikariPoolMXBean().getIdleConnections());
                    info.put("total_connections", hikariDS.getHikariPoolMXBean().getTotalConnections());
                    info.put("threads_awaiting_connection", hikariDS.getHikariPoolMXBean().getThreadsAwaitingConnection());
                } catch (Exception e) {
                    info.put("hikari_error", e.getMessage());
                }
            }
            
            return ResponseEntity.ok(info);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}