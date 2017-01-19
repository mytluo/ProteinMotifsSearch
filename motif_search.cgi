#!/usr/local/bin/python3

import cgi, json
import os
import mysql.connector

def main():
    print("Content-Type: application/json\n\n")
    form = cgi.FieldStorage()
    term = form.getvalue('search_term')    

    conn = mysql.connector.connect(user='', password='', host='', database='')
    cursor = conn.cursor()

    # append each SQL statement to be execute to a list
    sql = []
    sql.append("""CREATE TEMPORARY TABLE query (protein varchar(1000) NOT NULL)""")
    sql.append("""INSERT INTO query VALUE ("%s")""" % term)
    sql.append("""SELECT motif, subtype, prosite, regex, notes FROM final.protein_motifs INNER JOIN query ON (query.protein REGEXP protein_motifs.regex)""")
    # execute each statement in sql list
    for stmt in sql:
        cursor.execute(stmt)

    results = { 'possible_matches': 0, 'matches': list() }
    for (motif, subtype, prosite, regex, notes) in cursor:
        results['matches'].append({'motif': motif, 'type': subtype, 'pattern': prosite, 'regex': regex, 'notes': notes})
        results['possible_matches'] += 1

    conn.close()
    print(json.dumps(results))

if __name__ == '__main__':
    main()
