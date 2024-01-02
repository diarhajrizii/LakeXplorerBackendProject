function getSQLQuery(queryCode, vars = "") {
  let query = "";
  for (let i = 0; i < queryCode.length; i++) {
    const code = queryCode[i] + "";
    const code_type = code.substring(0, 1);
    switch (code_type) {
      case "1":
        query += getSelectQuery(code, vars);
        break;
      case "2":
        query += getInsertQuery(code);
        break;
      case "3":
        query += getUpdateQuery(code);
        break;
      case "4":
        query += getDeleteQuery(code);
        break;
      case "9":
        query += getAnalyticsQuery(code);
        break;
      default:
        return false;
    }
  }
  return query;
}

const getSelectQuery = (code, vars = "") => {
  const queries = {
    1000: `
        SELECT 			  U.*, C.name
        FROM 			    swiftyglobal_analytics.users U
        INNER JOIN (
          SELECT 			first_name, surname, birthday, count(id)
          FROM 			  swiftyglobal_analytics.users
          WHERE 			first_name IS NOT NULL
          AND			  	surname	IS NOT NULL
          GROUP BY 		first_name, surname, birthday
          HAVING 			count(id) > 1
        ) AS T
          ON          T.first_name = U.first_name
          AND         T.surname = U.surname
          LEFT JOIN swiftyglobalapp_dev.countries C
          ON C.cca2 = U.country
        WHERE         U.id IS NOT NULL
        AND           U.no_duplicate = 0
        {filter_query}
        GROUP BY      U.id
        ORDER BY      U.first_name`,
    1001: `SELECT * FROM users WHERE id = ?;`,
    1002: `
          SELECT DISTINCT   users_transaction.user_id, users_transaction.amount, users_transaction.id,
                            users_transaction.transaction_type, users_transaction.transaction_dt,
                            users_transaction.currency, users_transaction.description,
                            users.swifty_id, users.first_name, users.player_id,
                            users.surname
          FROM              users_transaction
          LEFT JOIN         users
            ON              users.real_user_id = users_transaction.user_id
          WHERE             user_id IS NOT NULL
          {filter_query}
          ORDER BY  transaction_dt asc LIMIT 3000`,
    1003: `
          SELECT 			swifty_id
          FROM 			  activity_log
          WHERE 			swifty_id IS NOT NULL
          AND 			  swifty_id <> ''
          AND 			  session_setted = 0
          LIMIT 1;`,
    1004: `
          SELECT 			  id, createdAt
          FROM 			    activity_log
          WHERE 			  session_setted = 0
          AND 			    swifty_id = ?
          ORDER BY 		  id;`,
    1005: `
          SELECT        *
          FROM          user_net_session
          WHERE         amount IS NULL
          ORDER BY      id
          LIMIT 1;`,
    1006: `
          SELECT 				SUM(wage) AS total_spent_amount
          FROM 				  user_bets_v2 UB
          LEFT JOIN			users U
            ON          U.real_user_id = UB.user_id
          WHERE 				swifty_id = ?
          and 				  createdAt >= ?
          and 				  createdAt <= ?
          GROUP BY 			UB.user_id;`,
    1007: `
          SELECT        UNS.swifty_id, UNS.start_time, UNS.end_time, UNS.id,
                        UNS.amount, U.real_user_id AS user_id, U.first_name, U.surname, U.player_id
          FROM          user_net_session UNS
          LEFT JOIN     users U
            ON          U.swifty_id = UNS.swifty_id
          WHERE         UNS.swifty_id IS NOT NULL
          AND           U.real_user_id IS NOT NULL
          AND           UNS.amount > 0
          {filter}
          ORDER BY      UNS.start_time DESC
          LIMIT 1000`,
    1008: `
          SELECT        id, user_id, return_amount, wage, createdAt
          FROM          user_bets_v2
          WHERE         id IS NOT NULL
          {filter}`,
    1009: `
          SELECT        id
          FROM          policy_version
          WHERE         language = ?
          AND           country = ?;`,
    1010: `SELECT id, version FROM policy_version WHERE id = ?;`,
    1011: `SELECT id, version  FROM terms_content WHERE id = ?;`,
    1012: `
      SELECT    id, first_name, surname, birthday
      FROM      users
      WHERE     no_duplicate = 1;
      `,
    1013: `
          SELECT    id, first_name, surname, birthday
          FROM      users
          WHERE     no_duplicate = 0
          AND       has_duplicate_hidden = 0;`,
    1014: `
          SELECT        id
          FROM          terms_content
          WHERE         language = ?
          AND           country = ?;`,
    1015: `
        SELECT DISTINCT   cms_users_activity.id , cms_users_activity.user_id , cms_users_activity.type ,
                                  cms_users_activity.value , cms_users_activity.createdAt , cms_users_activity.description ,
                          cms_users.id AS cms_users_id, cms_users.first_name AS cms_users_first_name,
                          cms_users.last_name AS cms_users_last_name, cms_users.email AS cms_users_email
        FROM  			      cms_users_activity
        LEFT JOIN 		    cms_users
          ON 			        cms_users.id = cms_users_activity.user_id
        WHERE             cms_users_activity.id IS NOT NULL
        {filter}
        ORDER BY          createdAt desc
        LIMIT 1000;`,
    1016: `
        SELECT  *
        FROM     error_logs
        WHERE fixed = 0
        {filter}
        ORDER BY id DESC
        LIMIT 1000;`,
    1017: `SELECT * FROM sport_order WHERE id = ?;`,
    1018: `SELECT * FROM sport_order WHERE country_code = ?;`,
    1019: `SELECT * FROM payment_gateways WHERE id = ?;`,
    1020: `SELECT value AS total FROM dashboard_aggregate WHERE name = ?;`,
    1021: `SELECT * FROM users WHERE country = ?;`,
    1022: `SELECT * FROM users;`,
    1023: `SELECT       T.user_id, SUM(IF(transaction_type='bet_win' {border}, amount, 0)) as total_amount,
                          U.player_id
            FROM      users_transaction T
            LEFT JOIN users U
            ON            U.real_user_id = T.user_id
            WHERE         user_id IS NOT NULL
            {border}
            {filter};`,
    1024: `
      SELECT  *
      FROM    user_reports
      WHERE user_id IS NOT NULL
      {filter_query};
      `,
    1025: `SELECT * FROM test_commands`,
    1026: ` SELECT      DISTINCT  *
    FROM        countries
    ORDER BY
    CASE        WHEN cca2 = 'GB'
    THEN        0
    ELSE        1
    END,        name ASC;`,
    1027: `SELECT id, name, status FROM payment_gateways WHERE hide = 0`,
    1028: `SELECT * FROM region`,
    1029: `SELECT * FROM sport ORDER BY name`,
    1030: `SELECT * FROM competitions_groups WHERE id IS NOT NULL`,
    1031: `SELECT * FROM period_leagues`,
    1032: `SELECT * FROM market_type_groups`,
    1033: `SELECT * FROM market_type_groups WHERE id IS NOT NULL AND sport_id = ?`,
    1034: `SELECT DISTINCT u.swifty_id, u.first_name, u.surname, u.created_at, u.suspend_account_for, u.player_id, ua.\`type\`, ua.\`description\`, ua.createdAt, ua.createdAt AS suspended_date_time
                FROM users as u
                RIGHT JOIN users_activity AS ua ON u.id = ua.user_id
                WHERE ua.user_id IS NOT NULL`,
    1035: `SELECT * FROM player`,
    1036: `SELECT * FROM player WHERE id IS NOT NULL {filter_query} ORDER BY name asc LIMIT 1000;`,
    1037: `SELECT
              DL.id,
              DL.sport_type,
              DL.league_id,
              DL.region_id,
              DL.ord,
              DL.sport_id,
              GROUP_CONCAT(
                CONCAT(C.name)
                ORDER BY C.genius_id
                SEPARATOR ', '
            ) AS competition_names
          FROM
              default_leagues DL
          LEFT JOIN
              competition C ON FIND_IN_SET(C.genius_id, DL.league_id) > 0
          WHERE
              DL.id IS NOT NULL ${vars}
          GROUP BY DL.id;
    `,
    // 1038: `SELECT UD.swifty_id, UD.email, UD.first_name, UD.real_user_id, UD.surname, UD.birthday, UD.gender, UD.phone, UD.address, UD.country, UD.wage_default, UD.currency, UD.total_withdrawal, UD.state, UD.created_at, UD.signuped, UD.signuped_at, UD.total_winnings, UD.total_losses, UD.balance, UD.total_deposit, UD.terms_conditions_version, UD.policies_version, UD.kyc_status, UD.language, UD.player_id, UD.suspended, UD.total_stakes, UD.test_users, U.push_sports_update_promotions, U.push_bet_updates, U.email_marketing_promotional, U.email_news_and_update
    //         FROM users UD
    //         LEFT JOIN users_settings U ON U.swifty_id = UD.swifty_id
    //         WHERE UD.swifty_id IS NOT NULL`,
    1038: `SELECT C.id, C.genius_id, C.name, C.gender, C.age_category, C.type, C.logo, C.sport_id, C.sport_slug, S.name as sportName
            FROM competitor AS C
            LEFT JOIN sport as S ON C.sport_id = S.genius_id
            WHERE C.id IS NOT NULL {filter_query} LIMIT 5000`,
    1039: `SELECT US.real_user_id, US.player_id, US.country, US.\`suspended\`, US.gamstop_suspended,
            gr.createdAt, gr.old_value, gr.new_value
            FROM user_gambling_reminder_activity_log as gr
            LEFT JOIN users as US
            ON US.id = gr.user_id
            WHERE gr.createdAt IS NOT NULL`,
    1040: `SELECT CM.id, CM.sport_id, CM.competition_id, CM.region_id, description, title, CM.details, numerator, denominator, betted_count, group_id, odd, bet_start_date, bet_end_date,
            show_start_date, show_end_date, CM.status, CM.result, archive, R.name AS region_name, S.name AS sport_name, C.name AS competition_name, M.name AS match_name,
            CM.created_at, CM.match_id
            FROM custom_market CM
            LEFT JOIN competition C
            ON C.genius_id = CM.competition_id
            LEFT JOIN sport S
            ON S.genius_id = CM.sport_id
            LEFT JOIN region R
            ON R.genius_id = CM.region_id
            LEFT JOIN \`match\` M
            ON M.genius_id = CM.match_id
            WHERE CM.id IS NOT NULL {filter_query}
            ORDER BY CM.id ASC;`,
    1041: `SELECT * FROM page_layout WHERE parent = 'home_page_layout';`,
    1042: `SELECT * FROM test_commands_results WHERE command_id =? AND createdAt >= ? AND createdAt <= ? LIMIT 50`,
    1043: `SELECT * FROM test_commands_results LIMIT 1000`,
    1044: `SELECT *,
          COUNT(*) AS total_bets,
          COUNT(IF(gs_result='winner', 1, null)) AS total_wins,
          COUNT(IF(gs_result='loser', 1, null)) AS total_losses,
          COUNT(IF(gs_result='pushed', 1, null)) AS total_pushed,
          CONCAT(COUNT(IF(gs_result IS NOT NULL, 1, null)), "/", COUNT(*)) AS resulted,
          SUM(wage) AS total_stake,
          SUM(return_amount) - SUM(wage) AS total_liability
        FROM user_bets_v2
        {filter_query}
        GROUP BY gs_match_id, gs_market_id`,
    1068: `SELECT * FROM page_layout WHERE parent = ? AND country = ? ORDER BY nr_order;`,
    1069: `SELECT * FROM dashboard_aggregate WHERE name = 'dashboard_total_users' AND page_type = 'dashboard';`,
    1070: `SELECT * FROM dashboard_aggregate WHERE name = 'dashboard_total_users_verified' AND page_type = 'dashboard';`,
    1071: `SELECT * FROM dashboard_aggregate WHERE name = 'dashboard_total_user_30_days' AND page_type = 'dashboard';`,
    1072: `SELECT * FROM dashboard_aggregate WHERE name = 'dashboard_total_active_user_30_days' AND page_type = 'dashboard';`,
    1073: `SELECT * FROM dashboard_aggregate WHERE name = 'dashboard_total_bets_30_days' AND page_type = 'dashboard';`,
    1074: `SELECT * FROM dashboard_aggregate WHERE name = 'dashboard_avg_bet_stage' AND page_type = 'dashboard';`,
    1075: `SELECT * FROM dashboard_aggregate WHERE name = 'dashboard_total_bets' AND page_type = 'dashboard';`,
    1076: `SELECT * FROM dashboard_aggregate WHERE name = 'dashboard_total_profit' AND page_type = 'dashboard';`,
    1077: `SELECT * FROM dashboard_aggregate WHERE name = 'dashboard_total_user_balance' AND page_type = 'dashboard';`,
    1078: `SELECT * FROM dashboard_aggregate WHERE name = 'dashboard_total_free_bet' AND page_type = 'dashboard';`,
    1079: `SELECT * FROM dashboard_aggregate WHERE name = 'dashboard_total_possible_wins' AND page_type = 'dashboard';`,
    1080: `SELECT 		  SUM(UB.return_amount - UB.wage) AS total_winnings, U.player_id, UB.user_id, U.swifty_id, AVG(wage) AS average_bet_price
            FROM 		    user_bets_v2 UB
            LEFT JOIN	  users U
              ON        U.real_user_id = UB.user_id
            WHERE       UB.gs_result = 'winner'
            AND		      U.id IS NOT NULL
            AND         U.test_users = 0
            GROUP BY    UB.user_id
            ORDER BY    total_winnings DESC
            LIMIT 5;`,
    1081: `SELECT 		  SUM(UB.wage) AS total_losses, UB.user_id, U.player_id, U.swifty_id, AVG(wage) AS average_bet_price
            FROM 		    user_bets_v2 UB
            LEFT JOIN	  users U
              ON        U.real_user_id = UB.user_id
            WHERE       UB.gs_result = 'loser'
            AND		      U.id IS NOT NULL
            AND         U.test_users = 0
            GROUP       BY UB.user_id
            ORDER       BY total_losses DESC
            LIMIT 5;`,
    1082: `SELECT 			COUNT(id) AS total_count, sport_id
              FROM 			  user_bets_v2
              WHERE       sport_id IS NOT NULL AND createdAt >= ? AND createdAt <= ?
              AND         user_id NOT IN (${vars})
              GROUP BY    sport_id;`,
    1083: `SELECT 			COUNT(id) as total_count, IF(gs_inplay = 1, 'In-Play', 'Pre-Match') as bet_type
            FROM 			  user_bets_v2
            WHERE       user_id NOT IN (${vars})
            AND         createdAt <= ?
            AND         createdAt >= ?
            GROUP BY    gs_inplay;`,
    1084: `SELECT 			COUNT(id) as total_count, bet_type
            FROM 			  user_bets_v2
            WHERE       user_id NOT IN (${vars})
            AND         createdAt <= ?
            AND         createdAt >= ?
            GROUP BY    bet_type`,
    1085: `SELECT 			COUNT(id) as total_count, bet_type
            FROM 			  user_bets_v2
            WHERE       user_id NOT IN (${vars})
            AND         createdAt <= ?
            AND         createdAt >= ?
            GROUP BY    bet_type`,
    1086: `SELECT * FROM dashboard_aggregate WHERE name = 'dashboard_total_unclosed_gs' AND page_type = 'dashboard';`,
    1087: `SELECT * FROM dashboard_aggregate WHERE name = 'dashboard_total_unclosed_special_bets' AND page_type = 'dashboard';`,
    1088: `SELECT * FROM dashboard_aggregate WHERE name = 'dashboard_total_open_bets' AND page_type = 'dashboard';`,
    1089: `SELECT * FROM cms_item WHERE type = ? AND country_code = "all" ORDER BY order_nr;`,
    1090: `
          `,
    1091: `SELECT id FROM users WHERE player_id = ? AND id NOT IN (${vars});`,
    1092: `SELECT       T.last_record, T.user_id, R.total_client_balance, R.total_open_bets
          FROM          users U
          RIGHT JOIN (
            SELECT      MAX(day_time) as last_record, user_id
            FROM        report_accounting_user_summary
            WHERE       day_time < '${vars.date}'
            AND         user_id ${vars.player_id_where} '${vars.user_id}'
            AND         user_id NOT IN (${vars.testUsersIds})
            GROUP BY    user_id
          ) as T
          ON            T.user_id = U.id
          LEFT JOIN     report_accounting_user_summary R
          ON            R.user_id = T.user_id AND R.day_time = T.last_record
    `,
    1093: `SELECT
                        user_id, balance_manual_debit, balance_manual_credit, deposits, withdrawals, total_client_balance,
                        total_open_bets, total_stakes, total_pushed, total_losses
          FROM          report_accounting_user_summary
          WHERE         day_time >= '${vars.date} 00:00:00' AND day_time <= '${vars.date} 23:59:59'
          AND           user_id NOT IN (${vars.testUsersIds})
          ORDER BY      user_id, day_time;
    `,
    1094: `SELECT       id, player_id, createdAt, currency
          FROM          users
          WHERE         createdAt <= ?
          AND           id not in (${vars})
          AND           player_id != ''
          ORDER BY      createdAt;
    `,
    1095: `SELECT      V.id, V.genius_id, V.region_id, V.name, V.capacity, V.latitude, V.longitude, R.name AS region_name
       FROM        venue V
       LEFT JOIN   region R
       ON          V.region_id = R.id {filter_query};`,
    1096: `SELECT  MT.id, MT.market_id, MT.market_name, MT.sport_id, MT.winners, MT.selection_count, MT.index, MT.handicap,
          MT.inplay_result, MT.type, MT.prematch, MT.inplay, MT.active,
          S.name AS sport_name, FM.tranding_status AS football_markets_tranding_status, FM.genius_market_id AS football_markets_genius_market_id,
          FM.decimal AS football_markets_decimal, T.total_selections, T.publish_name
          FROM market_type MT
          LEFT JOIN sport S
          ON S.genius_id = MT.sport_id
          LEFT JOIN markets FM
          ON FM.market_id = MT.market_id
          LEFT JOIN (
          SELECT COUNT(id) AS total_selections, GROUP_CONCAT(description_en SEPARATOR "%") AS publish_name, market_id
          FROM market_type_selections
          GROUP BY market_id
          ) AS T
          ON T.market_id = MT.market_id
          WHERE MT.market_id IS NOT NULL
          ${vars}
          GROUP BY MT.market_id
          ORDER BY MT.market_name ASC `,
    1097: `SELECT * FROM cms_media_library WHERE type = ? ORDER BY id DESC;`,
    1098: `SELECT order_nr FROM cms_item WHERE type = 'bet_slip' ORDER BY order_nr DESC;`,
    1099: `SELECT * FROM cms_item WHERE type = ? AND country_code = ? ORDER BY order_nr;`,
    1100: `SELECT * FROM settings WHERE show_hide = '1' ORDER BY description`,
    1101: `SELECT order_nr FROM cms_item WHERE type = 'carousel' ORDER BY order_nr DESC;`,
    1102: `SELECT       RD.id, RD.card_holder, RD.amount, RD.currency, RD.show_row, RD.createdAt,
                        U.first_name, U.surname, U.player_id, U.swifty_id
          FROM          report_deposit_different_names RD
          LEFT JOIN     users U
            ON          U.real_user_id = RD.real_user_id;`,
    1103: `SELECT * FROM pragmaticGames WHERE active = ? order by name;`,
    1104: `SELECT * FROM casino_groups WHERE type = ? ORDER BY ord;`,
    1105: `SELECT ord FROM casino_groups ORDER BY ord DESC;`,
    1106: `SELECT protected FROM casino_groups WHERE id = ?;`,
    1107: `SELECT * FROM casino_group_items WHERE group_id = ? ORDER BY order_nr;`,
    1108: `SELECT * FROM cms_item WHERE type = 'carousel'`,
    1109: `SELECT * FROM page_content ORDER BY friendly_name;`,
    1110: `SELECT * FROM casino_group_items WHERE group_id = ? AND game_id = ?`,
    1111: `SELECT nr_order FROM page_layout ORDER BY nr_order DESC;`,
    1112: `SELECT       UNS.swifty_id, UNS.start_time, UNS.end_time, UNS.id,
                      UNS.amount, U.real_user_id AS user_id, U.first_name, U.surname, U.player_id, U.currency
        FROM          user_net_session UNS
        LEFT JOIN     users U
          ON          U.swifty_id = UNS.swifty_id
        WHERE         UNS.swifty_id IS NOT NULL
        AND           U.real_user_id IS NOT NULL
        AND           UNS.amount > 0
        ${vars}
        ORDER BY      UNS.start_time DESC
        LIMIT 1000`,
    1113: `SELECT         U.sub_id as swifty_id, U.player_id, U.country, T.last_bet,
                          U.account_suspend as suspended, U.gamstop_suspended as suspended_gamstop
          FROM            users U
          RIGHT JOIN (
          SELECT      MAX(createdAt) last_bet, user_id_2 as user_id
          FROM        users_bets
          WHERE createdAt > ?
          AND   user_id_2 NOT IN (${vars})
          GROUP BY user_id_2
          ) AS T
          ON U.id = T.user_id
          WHERE gamstop_suspended = 0
          AND account_suspend = 0
          ORDER BY U.player_id
    `,
    1114: ` SELECT        U.sub_id as swifty_id, U.player_id, U.country, U.currency, U.createdAt,
                          U.account_suspend as suspended, U.gamstop_suspended as suspended_gamstop
            FROM          users U
            WHERE         createdAt >= ?
            AND           createdAt <= ?
            AND           player_id IS NOT NULL
            AND           player_id != ''
            AND           id NOT IN (${vars})
            ORDER BY      createdAt;`,
    1115: `SELECT
                      U.swifty_id as swity_id, U.player_id, U.country, U.suspended as suspended,
                      U.gamstop_suspended as suspended_gamstop,
                      L.createdAt as reopen_date, L.self_excluded_date
          FROM        user_first_login_after_self_exclude as L
          LEFT JOIN   users as U
          ON          U.id = L.user_id
          WHERE       L.createdAt >= ?
          AND         L.createdAt <= ?
          AND         L.user_id NOT IN (${vars})`,
    1116: `SELECT id FROM users WHERE sub_id = ?;`,
    1117: `SELECT * FROM users_favorite_leagues WHERE user_id = ? AND sport_type = ? ORDER BY ord*1 ASC;`,
    1118: `SELECT * FROM competition WHERE genius_id IN (${vars}) ORDER BY FIELD(genius_id, ${vars});`,
    1119: `SELECT * FROM competition WHERE sport_id = ? AND active = ? ORDER BY name;`,
    1120: `SELECT * FROM countries WHERE cca2 = ?;`,
    1121: `SELECT UD.id, UD.provider, UD.user_id, UD.transaction_id, UD.amount, UD.currency, UD.createdAt, UD.status, U.email AS users_email, U.player_id AS users_player_id, U.swifty_id AS users_swifty_id, U.first_name
    FROM user_deposit_payment UD
    LEFT JOIN users U ON U.real_user_id = UD.user_id
    WHERE UD.createdAt IS NOT NULL {filter}`,
    1122: `SELECT * FROM ladders WHERE sport_slug = ?;`,
    1123: `SELECT * FROM currencies WHERE code = ?;`,
    1124: `SELECT * FROM currencies;`,
    1125: `SELECT * FROM currencies WHERE id = ?;`,
    1127: `SELECT order_nr FROM cms_item WHERE type = 'sport_widget' ORDER BY order_nr DESC;`,
    1126: `SELECT * FROM affiliate_users WHERE slug = ?;`,
    1130: `SELECT * FROM affiliate_users;`,
    1131: `SELECT * FROM affiliate_users WHERE id = ?;`,
    1128: `SELECT order_nr FROM cms_item WHERE type = 'racing_widget' ORDER BY order_nr DESC;`,
    1129: `SELECT MAX(order_nr) as num FROM cms_item WHERE type = 'racing_widget'`,
    1132: `
        SELECT
    sm.id as "id",
    sm.date as "date",
    sm.venue as "venue",
    sm.category as "category",
    sm.country as "country",
    se.id as "event_id",
    se.name as "event_name",
    se.title as "event_title",
    se.time as "event_time",
    se.off_time as "event_off_time",
    se.resulted as "event_resulted",
    se.meeting_id as "event_meeting_id",
    ss.id as "selection_id",
    ss.born_date as "selection_born_date",
    ss.age as "selection_age",
    ss.bred as "selection_bred",
    ss.colour as "selection_colour",
    ss.drawn as "selection_drawn",
    ss.runner_num as "selection_runner_num",
    ss.dam as "selection_dam",
    ss.sire as "selection_sire",
    ss.jockey as "selection_jockey",
    ss.name as "selection_name",
    ss.owner as "selection_owner",
    ss.silk as "selection_silk",
    ss.event_id as "selection_event_id",
    sp.id as "price_id",
    sp.decimal as "price_decimal",
    sp.fraction as "price_fraction",
    sp.mkt_num as "price_mkt_num",
    sp.mkt_type as "price_mkt_type",
    sp.time as "price_time",
    sp.timestamp as "price_timestamp",
    sp.selection_id as "price_selection_id"
    from
    sis_provider.meeting as sm
    left join sis_provider.event as se on se.meeting_id = sm.id
    left join sis_provider.selections as ss on ss.event_id = se.id
    left join sis_provider.prices as sp on sp.selection_id = ss.id`,
    1133: `SELECT * FROM providers WHERE name = ?;`,
    1134: `SELECT * FROM providers WHERE id = ?;`,
    1135: `SELECT * FROM providers;`,
    1136: `SELECT * FROM favorite_reports WHERE report_slug = ? AND cms_sub_id = ?;`,
    1137: `SELECT * FROM favorite_reports WHERE cms_sub_id = ?;`,
    1138: `SELECT * FROM favorite_reports WHERE id = ?;`,
    1139: `SELECT         C.*, R.name AS region_name , S.name AS sport_name
          FROM            competition C
          LEFT JOIN       region R
          ON              C.region_id = R.genius_id
          LEFT JOIN       sport S
          ON              C.sport_id = S.genius_id
          WHERE           C.id IS NOT NULL
          ${vars}
          ORDER BY        C.name ASC
    `,
    1140: `SELECT * FROM cms_seo LIMIT 1`,
    1141: `SELECT * FROM swiftyglobalapp_dev.users WHERE sub_id =?`,
    1142: `SELECT * FROM swiftyglobalapp_dev.users_settings WHERE swifty_id = ?;`,
    1143: `SELECT * FROM swiftyglobalapp_dev.user_stake_factor WHERE sub_id = ? AND type = 'prematch';`,
    1144: `SELECT * FROM swiftyglobalapp_dev.user_stake_factor WHERE sub_id = ? AND type = 'inplay';`,
    1145: `SELECT * FROM swiftyglobalapp_dev.user_stake_factor WHERE sub_id = ? AND type = ?;`,
    1146: `SELECT * FROM ladders WHERE id = ?;`,
    1147: `SELECT * FROM users U WHERE U.id IS NOT NULL ${vars};`,
    1148: `SELECT     U.sub_id AS swifty_id,  U.email , U.first_name , U.id AS real_user_id , U.last_name AS surname,
          U.date_of_birth AS birthday, U.gender ,
          U.phone_number AS phone, U.address_line1 AS address, U.country ,
          U.wage_default , U.currency ,  U.state , U.createdAt, U.balance,
          U.kyc_status , U.language , U.player_id , U.account_suspend AS suspended,
          US.push_sports_update_promotions AS users_settings_push_sports_update_promotions,
          US.push_bet_updates AS users_settings_push_bet_updates,
          US.email_marketing_promotional AS users_settings_email_marketing_promotional,
          US.email_news_and_update AS users_settings_email_news_and_update
          FROM        users U
          LEFT JOIN   users_settings US ON US.swifty_id = U.sub_id
          WHERE       U.id NOT IN (${vars.testUsersIds}) ${vars.whereQuery} ORDER BY createdAt DESC;`,
    1149: `SELECT UD.id, UD.provider, UD.user_id, UD.transaction_id, UD.amount, UD.currency, UD.createdAt, UD.status,
          U.email AS users_email, U.player_id AS users_player_id, U.swifty_id AS users_swifty_id, U.first_name, U.surname, UPC.card_holder, U.created_at
          FROM swiftyglobal_analytics.user_deposit_payment UD
          LEFT JOIN swiftyglobal_analytics.users U ON U.real_user_id = UD.user_id
          LEFT JOIN swiftyglobalapp_dev.user_payment_card as UPC ON UPC.user_id = UD.user_id
          WHERE UD.createdAt IS NOT NULL;`,
    1150: `SELECT        as_day_time as row_date, total_open_bets, total_client_balance, R.total_stakes as as_total_stakes, 
          as_total_pushed, as_balance_manual_debit, as_balance_manual_credit, as_deposits,  
          as_withdrawals, as_total_losses, as_currency , U.player_id        FROM report_accounting_user_summary AS R   
          RIGHT JOIN (     SELECT      MAX(day_time) as day_time,      DATE_FORMAT(day_time,'%Y-%m-%d') as date   
          , user_id    FROM report_accounting_user_summary       
          GROUP BY DATE_FORMAT(day_time,'%Y-%m-%d') , user_id ) AS T 
          ON T.day_time = R.day_time AND T.user_id = R.user_id        
          LEFT JOIN (     SELECT      SUM(total_pushed) as as_total_pushed, 
          SUM(balance_manual_debit) as as_balance_manual_debit,      SUM(balance_manual_credit) as as_balance_manual_credit,  
          SUM(deposits) as as_deposits,      SUM(withdrawals) as as_withdrawals,   
          SUM(RA.total_losses) as as_total_losses,      DATE_FORMAT(day_time,'%Y-%m-%d') as as_day_time,   
          RA.currency as as_currency       , user_id    FROM report_accounting_user_summary as RA    WHERE currency IS NOT NULL 
          GROUP BY DATE_FORMAT(day_time,'%Y-%m-%d'), user_id    ORDER BY day_time     ) as T2 ON T2.as_day_time = T.date   
          LEFT JOIN users U ON U.real_user_id = R.user_id         WHERE          R.day_time >= ? AND R.day_time <= ? 
                     GROUP BY DATE_FORMAT(R.day_time,'%Y-%m-%d'), U.player_id, as_currency      ORDER BY R.day_time DESC;`,
  };

  return queries[code];
};

const getInsertQuery = (code) => {
  // 2XXX
  const queries = {
    2000: `INSERT INTO users_activity(user_id, type, description, createdAt) VALUE (?, ?, ?, ?);`,
    2001: `INSERT INTO user_net_session(swifty_id, start_time, end_time) VALUE (?, ?, ?);`,
    2002: `INSERT INTO policy_version (version, content, insertedDt, updatedDt, language, country) VALUES (?, ?, ?, ?, ?, ?);`,
    2003: `INSERT INTO terms_content (version, content, insertedDt, updatedDt, language, country) VALUES (?, ?, ?, ?, ?, ?);`,
    2004: `INSERT INTO user_timeline(user_id, type, description, createdAt) VALUES (?, ?, ?, ?);`,
    2005: `INSERT INTO sport_order(country_code, sport_slug, order_nr) VALUES (?, ?, ?);`,
    2006: `INSERT INTO push_notification_messages(title, message, created_dt, platform, country_id, sent_at, cms_user_id, type, object_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    2007: `INSERT INTO settings(name, value, description) VALUES (?, ?, ?)`,
    2008: `INSERT INTO ladders (in_decimal, in_fraction, pairing_decimal, pairing_fraction, sport_slug) VALUES ( ?,?,?,?,? );`,
    2009: `INSERT INTO currencies (name, code, symbol) VALUES (?,?,?);`,
    2010: `INSERT INTO affiliate_users (name, slug, notes, onboard_date, active) VALUES (?,?,?,?,?);`,
    2022: `INSERT INTO settings (name, value, description, editable, can_be_deleted, show_hide) VALUES(?,?,?,?,?,?) ON DUPLICATE KEY UPDATE value = VALUES(value);`,
    2023: `INSERT INTO providers(name, status, tags, blocked_countries, enabled_sports) VALUES (?,?,?,?,?);`,
    2024: `INSERT INTO favorite_reports(cms_sub_id, report_slug) VALUES (?,?);`,
    2025: `INSERT INTO swiftyglobalapp_dev.user_stake_factor(sub_id, type, sport_slug, value) VALUES (?,?,?,?);`,
    2026: `INSERT INTO users ( sub_id, email, createdAt, first_name, last_name, state, country, env_stage, 
      last_terms_conditions_version, last_privacy_version, currency, external_social_sub_id, sign_up_with, temp_password,
      email_verified, player_id, phone_number, address_line1, address_city, address_zip, language, phone_prefix, date_of_birth, affiliate_tag, kyc_applicant_id)
    VALUE (
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, 
      ?, ?, ?, ?, ?, ?);`,
    2027: `INSERT INTO users_settings (swifty_id, odds_format) VALUE (?, ?);`,
  };
  return queries[code];
};

const getUpdateQuery = (code) => {
  // 3XXX
  const queries = {
    3000: `UPDATE users SET suspended = ? WHERE id = ?;`,
    3001: `UPDATE users SET account_suspend = ?, account_suspended_until = ? WHERE id = ?;`,
    3002: `UPDATE market_type_selections SET active = ? WHERE id = ?;`,
    3003: `UPDATE activity_log SET session_setted = '1' WHERE id IN ({id});`,
    3004: `UPDATE user_net_session SET amount = ? WHERE id = ? AND swifty_id = ?;`,
    3005: `UPDATE \`match\` SET active = ? WHERE id = ?;`,
    3006: `UPDATE region SET status = ? WHERE id = ?;`,
    3007: `UPDATE policy_version SET version = ?, content = ?, language = ?, country = ?, updatedDt = ? WHERE id = ?`,
    3008: `UPDATE terms_content SET  version = ?, content = ?, language = ?, country = ?, updatedDt = ? WHERE id = ?;`,
    3009: `UPDATE terms_content SET  latest = ?  WHERE language = ? AND country = ?;`,
    3010: `UPDATE policy_version SET  latest = ?  WHERE language = ? AND country = ?;`,
    3011: `UPDATE sport_order SET sport_slug = ?, order_nr = ? WHERE country_code = ?;`,
    3012: `UPDATE users SET address_line1 = ?, address_line2 = ?, address_city = ?, address_zip = ?,
        address_country = ?, address_state = ?, birthday = ?, deposit_limit_daily = ?,
        deposit_limit_weekly = ?, deposit_limit_monthly = ?,
        reality_check_after = ?, profile_verification_provider = ?, phone = ?, prefix = ?, phone_number_verified = ? WHERE swifty_id = ?;`,
    3013: `UPDATE users SET address_line1 = ?, address_line2 = ?, address_city = ?, address_zip = ?,
        address_country = ?, address_state = ?, date_of_birth = ? WHERE sub_id = ?;`,
    3014: `UPDATE users_settings SET deposit_limit_daily = ?, deposit_limit_weekly = ?,  deposit_limit_monthly = ?, reality_check_after = ? WHERE swifty_id = ?;`,
    3015: `UPDATE users_settings SET deposit_limit_daily = ?, deposit_limit_weekly = ?,  deposit_limit_monthly = ?, reality_check_after = ? WHERE swifty_id = ?;`,
    3016: `UPDATE settings SET name = ?, value = ?, description = ?, show_hide = ? WHERE id = ? `,
    3017: `UPDATE ladders SET in_decimal = ?, in_fraction = ?, pairing_decimal = ?, pairing_fraction = ? WHERE id = ?;`,
    3018: `UPDATE currencies SET name = ?, code = ?, symbol = ?, enabled = ? WHERE code = ?;`,
    3019: `UPDATE affiliate_users SET name = ?, slug = ?, notes = ?, onboard_date = ?, active = ? WHERE id = ?;`,
    3030: `UPDATE providers SET name = ?, status = ?, tags = ?, blocked_countries = ?, enabled_sports = ? WHERE id = ?;`,
    3031: `UPDATE users
           SET  email = ?,
                first_name = ?,
                last_name = ?,
                phone_prefix = ?,
                phone_number = ?,
                address_line1 = ?,
                address_city = ?,
                address_zip = ?,
                country = ?,
                date_of_birth = ?,
                language = ?,
                currency = ?,
                affiliate_tag = ?,
                kyc_status = ?,
                account_status = ?,
                account_suspend = ?,
                sof_date = ?,
                ring_fenced_funds_enabled = ?,
                edd_date = ?,
                failed_login_attempts = ?
           WHERE sub_id = ?;`,
    3032: `UPDATE users
           SET bog_enabled = ? , trader_chat_enabled = ?, bet_referral_enabled = ?, cash_enabled = ?, cash_out_reduction = ?
           WHERE sub_id = ?
           ;`,
    3033: `UPDATE users_settings
           SET contact_preference_email = ?, contact_preference_sms = ?, contact_preference_phone = ?, bog_max_payout = ?, bonus_engine = ?
           WHERE swifty_id = ?
           ;`,
    3034: `UPDATE user_stake_factor
           SET value = ?
           WHERE sub_id = ?
           AND sport_slug = ?
           ;`,
  };
  return queries[code];
};

const getDeleteQuery = (code) => {
  const queries = {
    4010: `DELETE FROM user_payment_card WHERE id = ?`,
    4011: `DELETE FROM currencies WHERE id = ?;`,
    4012: `DELETE FROM affiliate_users WHERE id = ?;`,
    4013: `DELETE FROM providers WHERE id = ?;`,
    4014: `DELETE FROM favorite_reports WHERE id = ?;`,
    4015: `DELETE FROM cms_seo WHERE id = ?;`,
    4016: `DELETE FROM ladders WHERE id = ?;`,
  };
  return queries[code];
};

const getAnalyticsQuery = (code) => {
  const queries = {
    9000: ``,
  };
  return queries[code];
};

module.exports = getSQLQuery;
